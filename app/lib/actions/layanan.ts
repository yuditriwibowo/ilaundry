"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredLayanan } from "../data/layanan";
import type { State } from "./types";

const LayananSchema = z.object({
  id: z.string(),
  tipe_id: z.string(),
  durasi_id: z.string(),
  nama_layanan: z.string(),
  harga: z.coerce.number(),
  toko_id: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateLayanan = LayananSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_layanan: z.string().min(1, { message: "Nama layanan wajib diisi." }),
  harga: z.coerce.number().gt(0, { message: "Harga harus lebih dari 0." }),
  tipe_id: z.string().min(1, { message: "Tipe layanan wajib dipilih." }),
  durasi_id: z.string().min(1, { message: "Durasi layanan wajib dipilih." }),
});

const UpdateLayanan = LayananSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_layanan: z.string().min(1, { message: "Nama layanan wajib diisi." }),
  harga: z.coerce.number().gt(0, { message: "Harga harus lebih dari 0." }),
  tipe_id: z.string().min(1, { message: "Tipe layanan wajib dipilih." }),
  durasi_id: z.string().min(1, { message: "Durasi layanan wajib dipilih." }),
});

export async function createLayanan(prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateLayanan.safeParse({
    nama_layanan: formData.get("nama_layanan"),
    harga: formData.get("harga"),
    tipe_id: formData.get("tipe_id"),
    durasi_id: formData.get("durasi_id"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah layanan.",
    };
  }

  const { nama_layanan, harga, tipe_id, durasi_id, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO layanan (nama_layanan, harga, tipe_id, durasi_id, toko_id, created_at, last_update, update_by)
      VALUES (${nama_layanan}, ${harga}, ${tipe_id}, ${durasi_id}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah layanan.",
    };
  }
  revalidatePath("/laundry/pengaturan/layanan");
  redirect("/laundry/pengaturan/layanan");
}

export async function updateLayanan(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateLayanan.safeParse({
    nama_layanan: formData.get("nama_layanan"),
    harga: formData.get("harga"),
    tipe_id: formData.get("tipe_id"),
    durasi_id: formData.get("durasi_id"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui layanan.",
    };
  }

  const { nama_layanan, harga, tipe_id, durasi_id, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE layanan
      SET nama_layanan = ${nama_layanan}, harga = ${harga}, tipe_id = ${tipe_id}, durasi_id = ${durasi_id}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui layanan.",
    };
  }

  revalidatePath("/laundry/pengaturan/layanan");
  redirect("/laundry/pengaturan/layanan");
}

export async function deleteLayanan(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM layanan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Layanan.");
  }
  revalidatePath("/laundry/pengaturan/layanan");
}

export async function fetchMoreLayanan(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredLayanan(query, page);
}
