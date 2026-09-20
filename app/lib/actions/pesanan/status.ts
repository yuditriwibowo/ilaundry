"use server";

// Action workflow pesanan: update status & update pembayaran.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "../../db";
import { getCurrentUser } from "../../auth";
import { fetchPesananById } from "../../data/pesanan";
import { StatusPesananSchema, MetodePembayaranSchema } from "./schemas";
import type { UpdatePesananResult } from "./schemas";
import { insertTransaksiKeuangan } from "./helpers";
import type { TipeTransaksi } from "../../definitions";

// Update status pesanan (workflow: diproses -> selesai -> diambil, atau batal).
// tgl_selesai/tgl_diambil ikut disesuaikan; kembali ke diproses/batal
// mengosongkan keduanya. Kolom biaya & pembayaran tidak tersentuh.
export async function updateStatusPesanan(
  id: string,
  status_pesanan: string,
): Promise<UpdatePesananResult> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = (await getCurrentUser()).id;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(id);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      success: false,
      message: "Pesanan tidak ditemukan. Gagal memperbarui status pesanan.",
    };
  }

  const parsedStatus = StatusPesananSchema.safeParse(status_pesanan);
  if (!parsedStatus.success) {
    return { success: false, message: "Status pesanan tidak valid." };
  }
  const status = parsedStatus.data;

  const nowIso = new Date().toISOString();
  // Kolom tanggal mengikuti alur workflow:
  // - selesai/diambil → tgl_selesai diisi (jika masih kosong)
  // - diambil → tgl_diambil juga diisi (jika masih kosong)
  // - kembali ke diproses/batal → keduanya dikosongkan
  const tglSelesai =
    status === "selesai" || status === "diambil"
      ? existingPesanan.tgl_selesai ?? nowIso
      : null;
  const tglDiambil =
    status === "diambil" ? existingPesanan.tgl_diambil ?? nowIso : null;

  try {
    await sql.begin(async (tx) => {
      await tx`
        UPDATE pesanan SET
          status_pesanan = ${status},
          tgl_selesai = ${tglSelesai},
          tgl_diambil = ${tglDiambil},
          last_update = ${nowIso},
          update_by = ${userId}
        WHERE id = ${id}
      `;

      // Sinkronkan status item pesanan dengan status pesanan, KECUALI
      // kembali ke 'diproses':
      // - selesai → semua item jadi 'selesai', tgl_selesai item diisi
      //   (memakai tgl_selesai item yang sudah ada bila pernah diisi)
      // - diambil → semua item jadi 'diambil' (tgl_selesai juga terisi)
      // - batal → semua item jadi 'batal', tgl_selesai item dikosongkan
      // - diproses → item TIDAK diubah; status tiap item tetap apa adanya
      //   (item yang memang sudah selesai/batal tetap seperti itu, hanya
      //   item yang benar-benar kembali diproses yang diupdate terpisah
      //   per item)
      if (status !== "diproses") {
        await tx`
          UPDATE item_pesanan SET
            status_item = ${status},
            tgl_selesai = CASE
              WHEN ${status === "selesai" || status === "diambil"}
                THEN COALESCE(tgl_selesai, ${nowIso})
              ELSE NULL
            END,
            last_update = ${nowIso},
            update_by = ${userId}
          WHERE pesanan_id = ${id}
        `;
      }

      // Catat transaksi keuangan jika status berubah menjadi 'batal' (Rule 3)
      if (status === "batal" && Number(existingPesanan.jumlah_bayar) > 0) {
        await insertTransaksiKeuangan({
          tx,
          nama_transaksi: "Pembatalan Pesanan",
          tipe_transaksi: (existingPesanan.metode_pembayaran as TipeTransaksi) ?? null,
          nilai_kredit: Number(existingPesanan.jumlah_bayar),
          pesanan_id: id,
          toko_id: existingPesanan.toko_id,
          keterangan: existingPesanan.nomor_pesanan,
          update_by: userId,
        });
      }
    });
  } catch (error) {
    console.error("Database Error: Gagal memperbarui status pesanan.", error);
    return {
      success: false,
      message: "Database Error: Gagal memperbarui status pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(`/laundry/pesanan/${id}/detail`);
  const updated = await fetchPesananById(id);
  return { success: true, pesanan: updated };
}

// Update pembayaran pesanan: jumlah bayar & metode, lalu status pembayaran
// dan kurang bayar dihitung ulang dari total_bayar saat ini (rumus sama
// dengan create/update pesanan). Kolom biaya (total_layanan, diskon, dll.)
// tidak tersentuh.
export async function updatePembayaranPesanan(
  id: string,
  jumlah_bayar: number,
  metode_pembayaran?: string,
): Promise<UpdatePesananResult> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = (await getCurrentUser()).id;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(id);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      success: false,
      message: "Pesanan tidak ditemukan. Gagal memperbarui pembayaran.",
    };
  }

  const parsedJumlah = z.coerce.number().safeParse(jumlah_bayar);
  if (
    !parsedJumlah.success ||
    !Number.isFinite(parsedJumlah.data) ||
    parsedJumlah.data < 0
  ) {
    return { success: false, message: "Jumlah bayar tidak valid." };
  }
  const jumlah = parsedJumlah.data;

  const parsedMetode = MetodePembayaranSchema.safeParse(
    metode_pembayaran === "" ? undefined : metode_pembayaran,
  );
  const metode = parsedMetode.success ? parsedMetode.data : undefined;

  // Sama dengan aturan create/update pesanan:
  // jika jumlah bayar diisi (> 0), metode pembayaran wajib dipilih
  if (jumlah > 0 && !metode) {
    return {
      success: false,
      message:
        "Metode pembayaran wajib dipilih karena jumlah bayar sudah diisi.",
    };
  }

  const totalBayar = Number(existingPesanan.total_bayar) || 0;
  const statusPembayaran =
    jumlah <= 0 ? "belum_bayar" : jumlah >= totalBayar ? "lunas" : "DP";
  const kurangBayar = Math.max(0, totalBayar - jumlah);

  try {
    // Catat transaksi keuangan jika jumlah_bayar berubah (Rule 5)
    const jumlahBayarSebelumnya = Number(existingPesanan.jumlah_bayar) || 0;
    const selisih = jumlah - jumlahBayarSebelumnya;

    if (selisih !== 0) {
      if (selisih > 0) {
        // Tambahan pembayaran
        await insertTransaksiKeuangan({
          tx: sql,
          nama_transaksi: "Pembayaran",
          tipe_transaksi: (metode ?? null) as TipeTransaksi | null,
          nilai_debet: selisih,
          pesanan_id: id,
          toko_id: existingPesanan.toko_id,
          keterangan: existingPesanan.nomor_pesanan,
          update_by: userId,
        });
      } else {
        // Pengurangan pembayaran
        await insertTransaksiKeuangan({
          tx: sql,
          nama_transaksi: "Pengurangan Pembayaran",
          tipe_transaksi: (metode ?? null) as TipeTransaksi | null,
          nilai_kredit: Math.abs(selisih),
          pesanan_id: id,
          toko_id: existingPesanan.toko_id,
          keterangan: existingPesanan.nomor_pesanan,
          update_by: userId,
        });
      }
    }

    await sql`
      UPDATE pesanan SET
        status_pembayaran = ${statusPembayaran},
        metode_pembayaran = ${metode ?? null},
        jumlah_bayar = ${jumlah},
        kurang_bayar = ${kurangBayar},
        last_update = ${new Date().toISOString()},
        update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Database Error: Gagal memperbarui pembayaran pesanan.", error);
    return {
      success: false,
      message: "Database Error: Gagal memperbarui pembayaran pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(`/laundry/pesanan/${id}/detail`);
  const updated = await fetchPesananById(id);
  return { success: true, pesanan: updated };
}

