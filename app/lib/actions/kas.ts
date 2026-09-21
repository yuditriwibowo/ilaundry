"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import type { State } from "./types";

// Mutasi kas (penambahan/pengurangan) dicatat ke tabel transaksi_keuangan,
// tabel yang sama dengan pencatatan pembayaran pesanan:
// - Penambahan kas -> nilai_debet = jumlah
// - Pengurangan kas -> nilai_kredit = jumlah
// sehingga saldo di fetchLaporanKas otomatis ikut berubah.

const KasSchema = z.object({
  tipe_transaksi: z.enum(["tunai", "non_tunai"], {
    invalid_type_error: "Pilih tipe kas yang valid.",
  }),
  jumlah: z.coerce
    .number()
    .gt(0, { message: "Jumlah harus lebih dari 0." }),
  // Keterangan opsional: string kosong dinormalkan menjadi null.
  keterangan: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z.string().max(255, { message: "Keterangan maksimal 255 karakter." }).nullable(),
  ),
});

async function simpanKas(
  mode: "tambah" | "kurang",
  prevState: State,
  formData: FormData,
): Promise<State> {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  if (!selectedToko) {
    return {
      message: "Tidak ada toko yang dipilih. Silakan pilih toko terlebih dahulu.",
    };
  }

  const validatedFields = KasSchema.safeParse({
    tipe_transaksi: formData.get("tipe_transaksi"),
    jumlah: formData.get("jumlah"),
    keterangan: formData.get("keterangan"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as State["errors"],
      message: "Beberapa field tidak valid. Gagal menyimpan mutasi kas.",
    };
  }

  const { tipe_transaksi, jumlah, keterangan } = validatedFields.data;
  const isTambah = mode === "tambah";
  const namaTransaksi = isTambah ? "Penambahan Kas" : "Pengurangan Kas";
  const userId = user.id;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO transaksi_keuangan (
        waktu_transaksi,
        nama_transaksi,
        tipe_transaksi,
        nilai_debet,
        nilai_kredit,
        pesanan_id,
        toko_id,
        keterangan,
        created_at,
        last_update,
        update_by
      ) VALUES (
        ${now},
        ${namaTransaksi},
        ${tipe_transaksi},
        ${isTambah ? jumlah : 0},
        ${isTambah ? 0 : jumlah},
        null,
        ${selectedToko},
        ${keterangan},
        ${now},
        ${now},
        ${userId}
      )
    `;
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: `Database Error: Gagal menyimpan ${namaTransaksi.toLowerCase()}.`,
    };
  }

  revalidatePath("/laundry/laporan");
  redirect("/laundry/laporan");
}

export async function tambahKas(prevState: State, formData: FormData) {
  return simpanKas("tambah", prevState, formData);
}

export async function kurangiKas(prevState: State, formData: FormData) {
  return simpanKas("kurang", prevState, formData);
}