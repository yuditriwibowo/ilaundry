"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { sql } from "../db";
import { getCurrentUser, canManageInfoIklan } from "../auth";
import { fetchInfoIklanById, fetchFilteredInfoIklan } from "../data/info-iklan";
import type { State } from "./types";

const BASE_PATH = "/laundry/pengaturan/info-iklan";

// ==== Penyimpanan gambar upload ====
// File disimpan ke /public/carousel/ dan path RELATIFNYA (/carousel/<file>)
// disimpan di kolom image_src untuk ditampilkan di InfoCarousel.
const CAROUSEL_DIR = path.join(process.cwd(), "public", "carousel");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// MIME type -> ekstensi file yang diizinkan.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

// Nama file hasil upload sistem (UUID + ekstensi gambar).
const UPLOADED_FILENAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|avif|svg)$/i;

/**
 * Simpan file gambar dari form ke /public/carousel/ dan kembalikan
 * path relatifnya (mis. /carousel/<uuid>.png).
 * null bila tidak ada file yang diunggah (image_src opsional).
 */
async function saveUploadedImage(
  formData: FormData,
): Promise<{ path: string | null; error?: string }> {
  const file = formData.get("image_src");
  if (!file || typeof file === "string" || file.size === 0) {
    return { path: null };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { path: null, error: "Ukuran gambar maksimal 5 MB." };
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return {
      path: null,
      error:
        "Format gambar tidak didukung. Gunakan jpg, png, webp, gif, avif, atau svg.",
    };
  }
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(CAROUSEL_DIR, { recursive: true });
  await writeFile(path.join(CAROUSEL_DIR, filename), bytes);
  return { path: `/carousel/${filename}` };
}

/**
 * Hapus file gambar lama dari /public/carousel/ bila file itu hasil
 * upload sistem (nama file UUID). SVG prototype lama tidak ikut dihapus.
 * Error diabaikan — kegagalan hapus file tidak boleh gagalkan operasi utama.
 */
async function deleteCarouselImage(imageSrc: string | null) {
  if (!imageSrc || !imageSrc.startsWith("/carousel/")) return;
  const filename = imageSrc.replace("/carousel/", "");
  if (!UPLOADED_FILENAME_RE.test(filename)) return;
  try {
    await unlink(path.join(CAROUSEL_DIR, filename));
  } catch {
    // file sudah tidak ada / tidak bisa dihapus — abaikan.
  }
}

// Ambil teks dari form; string kosong menjadi null.
function nullableText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

// Konversi tanggal "YYYY-MM-DD" dari DatePicker.
// Bagian waktu di-hardcode: mulai 00:00, selesai akhir hari (24:00),
// dengan offset WIB (+07:00) eksplisit — pola sama dengan kas.ts
// (startTs/endTs). null bila kosong/invalid.
const TANGGAL_RE = /^\d{4}-\d{2}-\d{2}$/;

function startTsFromTanggal(value: string | null): string | null {
  if (!value || !TANGGAL_RE.test(value)) return null;
  return `${value}T00:00:00+07:00`;
}

function endTsFromTanggal(value: string | null): string | null {
  if (!value || !TANGGAL_RE.test(value)) return null;
  // 24:00 = akhir hari (23:59:59.999 WIB) — iklan berlaku sampai akhir
  // hari Selesai Berlaku, dan tanggal yang tampil di detail tetap sesuai
  // tanggal yang dipilih.
  return `${value}T23:59:59.999+07:00`;
}

const InfoIklanFormSchema = z
  .object({
    title: z.string().min(1, { message: "Judul wajib diisi." }),
    description: z.string().nullable(),
    link: z.string().nullable(),
    start: z.string().nullable(),
    end: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.start && data.end && new Date(data.end) < new Date(data.start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      });
    }
  });

export async function createInfoIklan(prevState: State, formData: FormData): Promise<State> {
  const user = await getCurrentUser();
  // Otorisasi: HANYA Administrator yang boleh mengelola Info & Iklan.
  if (!canManageInfoIklan(user.peran)) {
    return {
      message: "Anda tidak memiliki hak akses untuk mengelola Info & Iklan.",
    };
  }

  const validatedFields = InfoIklanFormSchema.safeParse({
    title: nullableText(formData.get("title")),
    description: nullableText(formData.get("description")),
    link: nullableText(formData.get("link")),
    start: nullableText(formData.get("start")),
    end: nullableText(formData.get("end")),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah Info & Iklan.",
    };
  }

  // Gambar: file upload ke /public/carousel/ (opsional).
  const image = await saveUploadedImage(formData);
  if (image.error) {
    return {
      errors: { image_src: [image.error] },
      message: image.error,
    };
  }

  const { title, description, link } = validatedFields.data;
  const image_src = image.path;
  const start = startTsFromTanggal(validatedFields.data.start);
  const end = endTsFromTanggal(validatedFields.data.end);
  const userId = user.id;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO info_iklan (title, description, image_src, link, start, "end", created_at, last_update, update_by)
      VALUES (${title}, ${description}, ${image_src}, ${link}, ${start}, ${end}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah Info & Iklan.",
    };
  }
  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function updateInfoIklan(id: string, prevState: State, formData: FormData): Promise<State> {
  const user = await getCurrentUser();
  // Otorisasi: HANYA Administrator yang boleh mengelola Info & Iklan.
  if (!canManageInfoIklan(user.peran)) {
    return {
      message: "Anda tidak memiliki hak akses untuk mengelola Info & Iklan.",
    };
  }

  const validatedFields = InfoIklanFormSchema.safeParse({
    title: nullableText(formData.get("title")),
    description: nullableText(formData.get("description")),
    link: nullableText(formData.get("link")),
    start: nullableText(formData.get("start")),
    end: nullableText(formData.get("end")),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui Info & Iklan.",
    };
  }

  // Gambar lama (untuk dihapus bila diganti file baru).
  const current = await fetchInfoIklanById(id);
  if (!current) {
    return {
      message: "Info & Iklan tidak ditemukan. Gagal memperbarui.",
    };
  }

  // Gambar: file upload baru (opsional). Bila tidak ada file baru,
  // image_src lama tetap dipakai.
  const image = await saveUploadedImage(formData);
  if (image.error) {
    return {
      errors: { image_src: [image.error] },
      message: image.error,
    };
  }
  if (image.path && current.image_src) {
    await deleteCarouselImage(current.image_src);
  }

  const { title, description, link } = validatedFields.data;
  const image_src = image.path ?? current.image_src;
  const start = startTsFromTanggal(validatedFields.data.start);
  const end = endTsFromTanggal(validatedFields.data.end);
  const userId = user.id;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE info_iklan
      SET title = ${title}, description = ${description}, image_src = ${image_src},
          link = ${link}, start = ${start}, "end" = ${end},
          last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui Info & Iklan.",
    };
  }

  revalidatePath(BASE_PATH);
  redirect(BASE_PATH);
}

export async function deleteInfoIklan(id: string) {
  const user = await getCurrentUser();
  // Otorisasi: HANYA Administrator yang boleh mengelola Info & Iklan.
  if (!canManageInfoIklan(user.peran)) {
    throw new Error(
      "Anda tidak memiliki hak akses untuk mengelola Info & Iklan.",
    );
  }
  try {
    // Hapus file gambar terkait (hanya yang hasil upload sistem).
    const current = await fetchInfoIklanById(id);
    if (current?.image_src) {
      await deleteCarouselImage(current.image_src);
    }
    await sql`DELETE FROM info_iklan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to delete Info & Iklan.");
  }
  revalidatePath(BASE_PATH);
}

export async function fetchMoreInfoIklan(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredInfoIklan(query, page);
}