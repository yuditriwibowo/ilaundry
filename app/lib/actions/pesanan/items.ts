"use server";

// Action item pesanan: tambah, ubah, hapus, dan update status satu item.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../../db";
import { getCurrentUser } from "../../auth";
import {
  fetchAllItemPesananByPesananId,
  fetchItemPesananById,
  fetchPesananById,
} from "../../data/pesanan";
import type { ItemPesanan } from "../../definitions";
import type { State } from "../types";
import { ItemPesananFormSchema, StatusPesananSchema } from "./schemas";
import type { UpdateItemStatusResult } from "./schemas";
import { recalcPesananTotals, resolveItemSnapshot } from "./helpers";

// ===== Tambah item pesanan (dari halaman detail pesanan) =====
// Hanya menambah SATU item pesanan per submit. Snapshot layanan/parfum/diskon
// diambil dari database (tidak dipercaya dari klien), lalu kolom biaya pesanan
// dihitung ulang dari SELURUH item agar total di list & detail tetap sinkron
// (rumus sama dengan createPesanan/updatePesanan).
export async function createItemPesanan(
  pesananId: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = cookieStore.get("user_id")?.value || null;
  const detailHref = `/laundry/pesanan/${pesananId}/detail`;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(pesananId);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      message: "Pesanan tidak ditemukan. Gagal menambah item pesanan.",
    };
  }

  const validatedFields = ItemPesananFormSchema.safeParse({
    layanan_id: formData.get("layanan_id"),
    jumlah: formData.get("jumlah"),
    satuan: formData.get("satuan"),
    parfum_id: formData.get("parfum_id"),
    diskon_id: formData.get("diskon_id"),
    catatan_item: formData.get("catatan_item"),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      errors: {
        layanan_id: fieldErrors.layanan_id,
        jumlah: fieldErrors.jumlah,
        satuan: fieldErrors.satuan,
      },
      message: "Beberapa field tidak valid. Gagal menambah item pesanan.",
    };
  }

  const { layanan_id, jumlah, satuan, parfum_id, diskon_id, catatan_item } =
    validatedFields.data;

  const now = new Date();
  const nowIso = now.toISOString();

  // Snapshot harga/diskon + estimasi dari database (helper bersama)
  const resolved = await resolveItemSnapshot({
    layanan_id,
    jumlah,
    parfum_id,
    diskon_id,
    now,
  });
  if ("error" in resolved) {
    return {
      errors: { layanan_id: [resolved.error] },
      message: "Beberapa field tidak valid. Gagal menambah item pesanan.",
    };
  }
  const {
    layanan,
    namaParfum,
    diskonId,
    subtotal,
    nilaiDiskon,
    subtotalFinal,
    estimasi,
  } = resolved.snapshot;

  // Status item baru mengikuti status pesanan saat ini (logika sama dengan
  // updatePesanan) agar item tidak salah tampil 'diproses' pada pesanan yang
  // sudah selesai/diambil/batal.
  const statusPesananSaatIni = existingPesanan.status_pesanan;
  const statusItemBaru =
    statusPesananSaatIni === "batal" ||
    statusPesananSaatIni === "selesai" ||
    statusPesananSaatIni === "diambil"
      ? statusPesananSaatIni
      : "diproses";
  const tglSelesaiItemBaru =
    statusItemBaru === "selesai" || statusItemBaru === "diambil" ? nowIso : null;

  // Nomor item melanjutkan urutan yang sudah ada: prefix nomor pesanan +
  // (nomor urut terbesar + 1). Memakai nomor terbesar, bukan jumlah baris,
  // supaya tidak bentrok setelah ada item yang dihapus.
  const existingItems = await fetchAllItemPesananByPesananId(pesananId);
  const nomorPesanan = existingPesanan.nomor_pesanan ?? "";
  const maxNomor = existingItems.reduce((max, item) => {
    const suffix = item.nomor_item_pesanan?.split("-").pop();
    const parsed = Number(suffix);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
  const nomorItemBaru = `${nomorPesanan}-${maxNomor + 1}`;

  // Insert item baru + hitung ulang kolom biaya pesanan dalam satu transaksi.
  try {
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO item_pesanan (
          pesanan_id, nama_parfum_snapshot, nomor_item_pesanan, nama_layanan_snapshot,
          tipe_layanan_snapshot, durasi_snapshot, harga_satuan, jumlah, satuan, subtotal,
          catatan_item, status_item, diskon_id, nilai_diskon, tgl_item_pesanan,
          nilai_durasi, tgl_estimasi_selesai, tgl_selesai, subtotal_final,
          created_at, last_update, update_by
        ) VALUES (
          ${pesananId}, ${namaParfum}, ${nomorItemBaru}, ${layanan.nama_layanan},
          ${layanan.nama_tipe}, ${layanan.nama_durasi}, ${layanan.harga}, ${jumlah}, ${satuan}, ${subtotal},
          ${catatan_item || null}, ${statusItemBaru}, ${diskonId}, ${nilaiDiskon}, ${nowIso},
          ${layanan.lama_durasi ?? null}, ${estimasi}, ${tglSelesaiItemBaru}, ${subtotalFinal},
          ${nowIso}, ${nowIso}, ${userId}
        )
      `;

      // Hitung ulang kolom biaya pesanan dari seluruh item (helper bersama).
      await recalcPesananTotals(tx, pesananId, nowIso, userId);
    });
  } catch (error) {
    console.error("Database Error: Gagal menambah item pesanan.", error);
    return { message: "Database Error: Gagal menambah item pesanan." };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(detailHref);
  redirect(detailHref);
}

// ===== Ubah item pesanan (dari halaman detail pesanan) =====
// Mengubah SATU item pesanan yang sudah ada. Nomor item, status item, tanggal
// item dibuat, dan tanggal item selesai TIDAK diubah oleh aksi ini. Setelah
// item diperbarui, seluruh kolom biaya pesanan dihitung ulang dari semua item
// (helper recalcPesananTotals) supaya total di list, detail, dan struk sinkron.
export async function updateItemPesanan(
  pesananId: string,
  itemId: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = cookieStore.get("user_id")?.value || null;
  const detailHref = `/laundry/pesanan/${pesananId}/detail`;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(pesananId);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      message: "Pesanan tidak ditemukan. Gagal memperbarui item pesanan.",
    };
  }

  // Pastikan item ada dan memang milik pesanan tersebut
  const existingItem = await fetchItemPesananById(itemId);
  if (!existingItem || existingItem.pesanan_id !== pesananId) {
    return {
      message: "Item pesanan tidak ditemukan. Gagal memperbarui item pesanan.",
    };
  }

  const validatedFields = ItemPesananFormSchema.safeParse({
    layanan_id: formData.get("layanan_id"),
    jumlah: formData.get("jumlah"),
    satuan: formData.get("satuan"),
    parfum_id: formData.get("parfum_id"),
    diskon_id: formData.get("diskon_id"),
    catatan_item: formData.get("catatan_item"),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      errors: {
        layanan_id: fieldErrors.layanan_id,
        jumlah: fieldErrors.jumlah,
        satuan: fieldErrors.satuan,
      },
      message: "Beberapa field tidak valid. Gagal memperbarui item pesanan.",
    };
  }

  const { layanan_id, jumlah, satuan, parfum_id, diskon_id, catatan_item } =
    validatedFields.data;

  const now = new Date();
  const nowIso = now.toISOString();

  // Snapshot harga/diskon + estimasi dari database (helper bersama)
  const resolved = await resolveItemSnapshot({
    layanan_id,
    jumlah,
    parfum_id,
    diskon_id,
    now,
  });
  if ("error" in resolved) {
    return {
      errors: { layanan_id: [resolved.error] },
      message: "Beberapa field tidak valid. Gagal memperbarui item pesanan.",
    };
  }
  const {
    layanan,
    namaParfum,
    diskonId,
    subtotal,
    nilaiDiskon,
    subtotalFinal,
    estimasi,
  } = resolved.snapshot;

  // Update item + hitung ulang kolom biaya pesanan dalam satu transaksi.
  try {
    await sql.begin(async (tx) => {
      await tx`
        UPDATE item_pesanan SET
          nama_parfum_snapshot = ${namaParfum},
          nama_layanan_snapshot = ${layanan.nama_layanan},
          tipe_layanan_snapshot = ${layanan.nama_tipe},
          durasi_snapshot = ${layanan.nama_durasi},
          harga_satuan = ${layanan.harga},
          jumlah = ${jumlah},
          satuan = ${satuan},
          subtotal = ${subtotal},
          catatan_item = ${catatan_item || null},
          diskon_id = ${diskonId},
          nilai_diskon = ${nilaiDiskon},
          nilai_durasi = ${layanan.lama_durasi ?? null},
          tgl_estimasi_selesai = ${estimasi},
          subtotal_final = ${subtotalFinal},
          last_update = ${nowIso},
          update_by = ${userId}
        WHERE id = ${itemId} AND pesanan_id = ${pesananId}
      `;

      // Hitung ulang kolom biaya pesanan dari seluruh item (helper bersama).
      await recalcPesananTotals(tx, pesananId, nowIso, userId);
    });
  } catch (error) {
    console.error("Database Error: Gagal memperbarui item pesanan.", error);
    return { message: "Database Error: Gagal memperbarui item pesanan." };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(detailHref);
  redirect(detailHref);
}

// Item dihapus permanen, lalu kolom biaya pesanan dihitung ulang dari item
// yang tersisa agar total di list & detail tidak menyimpan nilai item yang
// sudah dihapus.
export async function deleteItemPesanan(id: string, pesananId: string) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const nowIso = new Date().toISOString();
  try {
    await sql.begin(async (tx) => {
      await tx`
        DELETE FROM public.item_pesanan
        WHERE id = ${id} AND pesanan_id = ${pesananId}
      `;
      await recalcPesananTotals(tx, pesananId, nowIso, userId);
    });
  } catch (error) {
    console.error("Database Error: Failed to Delete Item Pesanan.", error);
    throw new Error("Database Error: Failed to Delete Item Pesanan.");
  }
  revalidatePath(`/laundry/pesanan/${pesananId}/detail`);
  revalidatePath("/laundry/pesanan");
}

// Update status satu item pesanan (workflow per item: diproses -> selesai ->
// diambil, atau batal). tgl_selesai item ikut disesuaikan: selesai/diambil
// mengisinya (memakai nilai lama bila pernah diisi), kembali ke diproses/batal
// mengosongkannya. Aturan validasi & sinkronisasi dengan pesanan induk:
// - Pesanan yang sudah 'diambil' tidak boleh mengubah status item lagi.
// - Item yang kembali 'diproses' mengembalikan status pesanan ke 'diproses'
//   (tgl_selesai/tgl_diambil pesanan dikosongkan, konsisten dengan
//   updateStatusPesanan kembali ke diproses), dan estimasi selesai pesanan
//   diambil dari estimasi TERLAMA (MAX) item pesanan yang masih 'diproses'.
// Untuk status item lain, status pesanan tidak diubah.
export async function updateStatusItemPesanan(
  itemId: string,
  pesananId: string,
  status_item: string,
): Promise<UpdateItemStatusResult> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = cookieStore.get("user_id")?.value || null;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih, dan item ada
  // dan memang milik pesanan tersebut (kedua query independen → paralel).
  const [existingPesanan, existingItem] = await Promise.all([
    fetchPesananById(pesananId),
    fetchItemPesananById(itemId),
  ]);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      success: false,
      message: "Pesanan tidak ditemukan. Gagal memperbarui status item.",
    };
  }

  if (!existingItem || existingItem.pesanan_id !== pesananId) {
    return {
      success: false,
      message: "Item pesanan tidak ditemukan. Gagal memperbarui status item.",
    };
  }

  // Pesanan yang sudah 'diambil' tidak boleh mengubah status item lagi.
  if (existingPesanan.status_pesanan === "diambil") {
    return {
      success: false,
      message:
        "Pesanan sudah diambil. Status item pesanan tidak dapat diubah lagi.",
    };
  }

  // Enum status item sama dengan enum status pesanan
  const parsedStatus = StatusPesananSchema.safeParse(status_item);
  if (!parsedStatus.success) {
    return { success: false, message: "Status item tidak valid." };
  }
  const status = parsedStatus.data;

  const nowIso = new Date().toISOString();
  try {
    if (status === "diproses") {
      // Item kembali 'diproses' → status pesanan ikut kembali 'diproses'
      // dalam satu transaksi: tgl_selesai/tgl_diambil pesanan dikosongkan
      // (konsisten dengan updateStatusPesanan kembali ke diproses), dan
      // tgl_estimasi_selesai pesanan diambil dari estimasi TERLAMA (MAX)
      // item pesanan yang statusnya masih 'diproses'.
      await sql.begin(async (tx) => {
        await tx`
          UPDATE item_pesanan SET
            status_item = ${status},
            tgl_selesai = NULL,
            last_update = ${nowIso},
            update_by = ${userId}
          WHERE id = ${itemId} AND pesanan_id = ${pesananId}
        `;

        await tx`
          UPDATE pesanan SET
            status_pesanan = ${status},
            tgl_selesai = NULL,
            tgl_diambil = NULL,
            tgl_estimasi_selesai = (
              SELECT MAX(tgl_estimasi_selesai)
              FROM item_pesanan
              WHERE pesanan_id = ${pesananId} AND status_item = ${status}
            ),
            last_update = ${nowIso},
            update_by = ${userId}
          WHERE id = ${pesananId}
        `;
      });
    } else {
      // Status item lain: hanya item yang berubah, status pesanan tidak
      // tersentuh (mengikuti alur existing).
      await sql`
        UPDATE item_pesanan SET
          status_item = ${status},
          tgl_selesai = CASE
            WHEN ${status === "selesai" || status === "diambil"}
              THEN COALESCE(tgl_selesai, ${nowIso})
            ELSE NULL
          END,
          last_update = ${nowIso},
          update_by = ${userId}
        WHERE id = ${itemId} AND pesanan_id = ${pesananId}
      `;
    }
  } catch (error) {
    console.error("Database Error: Gagal memperbarui status item pesanan.", error);
    return {
      success: false,
      message: "Database Error: Gagal memperbarui status item pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(`/laundry/pesanan/${pesananId}/detail`);
  const updated = await fetchItemPesananById(itemId);
  return { success: true, item: updated ?? undefined };
}


