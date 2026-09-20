"use server";

// Action CRUD pesanan (tambah, ubah, hapus, ambil lebih banyak).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../../db";
import { getCurrentUser } from "../../auth";
import {
  fetchAllItemPesananByPesananId,
  fetchFilteredPesanan,
  fetchItemPesananByPesananId,
  fetchPesananById,
} from "../../data/pesanan";
import type { TabelLayanan, Diskon, AntarJemput, TipeTransaksi } from "../../definitions";
import type { State } from "../types";
import { PesananForm } from "./schemas";
import type { DeletePesananResult } from "./schemas";
import { insertTransaksiKeuangan } from "./helpers";

export async function createPesanan(prevState: State, formData: FormData): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = (await getCurrentUser()).id;

  let rawItems: unknown = [];
  try {
    rawItems = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return {
      errors: { items: ["Data item pesanan tidak valid."] },
      message: "Beberapa field tidak valid. Gagal menambah pesanan.",
    };
  }

  const validatedFields = PesananForm.safeParse({
    pelanggan_id: formData.get("pelanggan_id"),
    antar_jemput_yt: formData.get("antar_jemput_yt"),
    antar_jemput_id: formData.get("antar_jemput_id"),
    metode_pembayaran: formData.get("metode_pembayaran"),
    jumlah_bayar: formData.get("jumlah_bayar"),
    catatan: formData.get("catatan"),
    items: rawItems,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const itemsErrors: string[] = [];
    validatedFields.error.issues.forEach((issue) => {
      if (issue.path[0] === "items") {
        const index = typeof issue.path[1] === "number" ? issue.path[1] + 1 : null;
        const field = issue.path[2] ? ` (${issue.path[2]})` : "";
        const text = index ? `Item ${index}${field}: ${issue.message}` : issue.message;
        if (!itemsErrors.includes(text)) itemsErrors.push(text);
      }
    });

    return {
      errors: {
        pelanggan_id: fieldErrors.pelanggan_id,
        antar_jemput_id: fieldErrors.antar_jemput_id,
        metode_pembayaran: fieldErrors.metode_pembayaran,
        jumlah_bayar: fieldErrors.jumlah_bayar,
        items: itemsErrors.length > 0 ? itemsErrors : undefined,
      },
      message: "Beberapa field tidak valid. Gagal menambah pesanan.",
    };
  }

  const { pelanggan_id, antar_jemput_yt, antar_jemput_id, metode_pembayaran, jumlah_bayar, catatan, items } =
    validatedFields.data;

  const now = new Date();
  const nowIso = now.toISOString();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  // Ambil nama toko yang dipilih untuk prefix nomor pesanan (huruf awal nama toko)
  const tokoRows = await sql<{ nama_toko: string }[]>`
    SELECT nama_toko
    FROM toko
    WHERE id = ${selectedToko}
  `;
  const prefixNomor = tokoRows[0]?.nama_toko?.charAt(0).toUpperCase() || "PSN";
  const nomorPesanan = `${prefixNomor}-${stamp}`;
  // Ambil data referensi untuk snapshot item pesanan
  const layananIds = items.map((item) => item.layanan_id);
  const layananRows = await sql<TabelLayanan[]>`
    SELECT
      l.id,
      l.nama_layanan,
      l.harga,
      tl.nama_tipe,
      d.nama_durasi,
      d.lama_durasi,
      t.nama_toko
    FROM layanan l
    JOIN tipe_layanan tl ON l.tipe_id = tl.id
    JOIN durasi d ON l.durasi_id = d.id
    LEFT JOIN toko t ON l.toko_id = t.id
    WHERE l.id = ANY(${layananIds})
  `;
  const layananMap = new Map(layananRows.map((row) => [row.id, row]));
  if (items.some((item) => !layananMap.has(item.layanan_id))) {
    return {
      errors: {
        items: [
          "Beberapa layanan tidak ditemukan. Silakan periksa kembali item pesanan.",
        ],
      },
      message: "Beberapa field tidak valid. Gagal menambah pesanan.",
    };
  }

  const parfumIds = items
    .map((item) => item.parfum_id)
    .filter((id): id is string => Boolean(id));
  const parfumRows =
    parfumIds.length > 0
      ? await sql<{ id: string; nama_parfum: string }[]>`
          SELECT id, nama_parfum FROM parfum WHERE id = ANY(${parfumIds})
        `
      : [];
  const parfumMap = new Map(
    parfumRows.map((row) => [row.id, row.nama_parfum]),
  );

  let namaAntarJemput: string | null = null;
  let biayaAntarJemput = 0;
  if (antar_jemput_yt === "ya" && antar_jemput_id) {
    const antarJemputRows = await sql<AntarJemput[]>`
      SELECT id, nama_antar_jemput, harga_antar_jemput
      FROM antar_jemput
      WHERE id = ${antar_jemput_id}
    `;
    if (antarJemputRows.length === 0) {
      return {
        errors: { antar_jemput_id: ["Layanan antar-jemput tidak ditemukan."] },
        message: "Beberapa field tidak valid. Gagal menambah pesanan.",
      };
    }
    namaAntarJemput = antarJemputRows[0].nama_antar_jemput;
    biayaAntarJemput = Number(antarJemputRows[0].harga_antar_jemput);
  }

  // Ambil data referensi diskon untuk item yang punya diskon
  const diskonIds = items
    .map((item) => item.diskon_id)
    .filter((id): id is string => Boolean(id));
  const diskonRows =
    diskonIds.length > 0
      ? await sql<Pick<Diskon, "id" | "tipe_diskon" | "nilai_diskon">[]>`
          SELECT id, tipe_diskon, nilai_diskon FROM diskon WHERE id = ANY(${diskonIds})
        `
      : [];
  const diskonMap = new Map(diskonRows.map((row) => [row.id, row]));

  // Hitung subtotal, diskon, subtotal final & estimasi selesai per item
  // (berdasarkan durasi layanan). Nilai diskon per item:
  // - Persentase: (diskon.nilai_diskon / 100) * subtotal item
  // - Nominal: diskon.nilai_diskon langsung dipakai
  // Dibatasi maksimal subtotal item agar subtotal_final tidak negatif.
  const itemCalc = items.map((item, index) => {
    const layanan = layananMap.get(item.layanan_id)!;
    const subtotal = Number(layanan.harga) * item.jumlah;
    const diskon = item.diskon_id ? diskonMap.get(item.diskon_id) : undefined;
    const nilaiDiskon = diskon
      ? Math.min(
          Math.max(
            0,
            diskon.tipe_diskon === "Persentase"
              ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
              : Number(diskon.nilai_diskon),
          ),
          subtotal,
        )
      : 0;
    const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
    const estimasi =
      layanan.lama_durasi != null
        ? new Date(
            now.getTime() + Number(layanan.lama_durasi) * 60 * 60 * 1000,
          ).toISOString()
        : null;
    return {
      ...item,
      layanan,
      subtotal,
      diskonId: diskon ? item.diskon_id! : null,
      nilaiDiskon,
      subtotalFinal,
      estimasi,
      namaParfum: item.parfum_id ? parfumMap.get(item.parfum_id) ?? null : null,
      nomor: index + 1,
    };
  });

  const totalLayanan = itemCalc.reduce((sum, item) => sum + item.subtotal, 0);
  // Nilai diskon pesanan = total semua item_pesanan.nilai_diskon
  const nilaiDiskon = itemCalc.reduce((sum, item) => sum + item.nilaiDiskon, 0);

  const totalBayar = Math.max(0, totalLayanan + biayaAntarJemput - nilaiDiskon);
  const kurangBayar = Math.max(0, totalBayar - jumlah_bayar);
  const statusPembayaran =
    jumlah_bayar <= 0
      ? "belum_bayar"
      : jumlah_bayar >= totalBayar
        ? "lunas"
        : "DP";

  const estimasiList = itemCalc
    .map((item) => item.estimasi)
    .filter((estimasi): estimasi is string => Boolean(estimasi))
    .sort();
  const tglEstimasiSelesai =
    estimasiList.length > 0 ? estimasiList[estimasiList.length - 1] : null;
  // Insert pesanan + item pesanan dalam satu transaksi
  try {
    await sql.begin(async (tx) => {
      const inserted = await tx<{ id: string }[]>`
        INSERT INTO pesanan (
          toko_id, pelanggan_id, kasir_id, nomor_pesanan, status_pesanan,
          tgl_pesanan, tgl_estimasi_selesai, tgl_selesai, tgl_diambil,
          nama_antar_jemput_snapshot, total_layanan, biaya_antar_jemput,
          nilai_diskon, total_bayar, status_pembayaran, metode_pembayaran,
          jumlah_bayar, kurang_bayar, catatan, created_at, last_update, update_by, antar_jemput_yt
        ) VALUES (
          ${selectedToko}, ${pelanggan_id}, ${userId}, ${nomorPesanan}, 'diproses',
          ${nowIso}, ${tglEstimasiSelesai}, null, null,
          ${namaAntarJemput}, ${totalLayanan}, ${biayaAntarJemput},
          ${nilaiDiskon}, ${totalBayar}, ${statusPembayaran}, ${metode_pembayaran ?? null},
          ${jumlah_bayar}, ${kurangBayar}, ${catatan || null}, ${nowIso}, ${nowIso}, ${userId}, ${antar_jemput_yt}
        )
        RETURNING id
      `;
      const pesananId = inserted[0].id;

      for (const item of itemCalc) {
        await tx`
          INSERT INTO item_pesanan (
            pesanan_id, nama_parfum_snapshot, nomor_item_pesanan, nama_layanan_snapshot,
            tipe_layanan_snapshot, durasi_snapshot, harga_satuan, jumlah, satuan, subtotal,
            catatan_item, status_item, diskon_id, nilai_diskon, tgl_item_pesanan,
            nilai_durasi, tgl_estimasi_selesai, tgl_selesai, subtotal_final,
            created_at, last_update, update_by
          ) VALUES (
            ${pesananId}, ${item.namaParfum}, ${nomorPesanan + "-" + item.nomor}, ${item.layanan.nama_layanan},
            ${item.layanan.nama_tipe}, ${item.layanan.nama_durasi}, ${item.layanan.harga}, ${item.jumlah}, ${item.satuan}, ${item.subtotal},
            null, 'diproses', ${item.diskonId}, ${item.nilaiDiskon}, ${nowIso},
            ${item.layanan.lama_durasi ?? null}, ${item.estimasi}, null, ${item.subtotalFinal},
            ${nowIso}, ${nowIso}, ${userId}
          )
        `;
      }

      // Catat transaksi keuangan jika ada pembayaran (Rule 1)
      if (Number(jumlah_bayar) > 0) {
        await insertTransaksiKeuangan({
          tx,
          nama_transaksi: "Pembayaran",
          tipe_transaksi: (metode_pembayaran as TipeTransaksi) ?? null,
          nilai_debet: Number(jumlah_bayar),
          pesanan_id: pesananId,
          toko_id: selectedToko,
          keterangan: nomorPesanan,
          update_by: userId,
        });
      }
    });
  } catch (error) {
    console.error("Database Error: Gagal menambah pesanan.", error);
    return {
      message: "Database Error: Gagal menambah pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  redirect("/laundry/pesanan");
}

export async function updatePesanan(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = (await getCurrentUser()).id;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(id);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      message: "Pesanan tidak ditemukan. Gagal memperbarui pesanan.",
    };
  }

  let rawItems: unknown = [];
  try {
    rawItems = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return {
      errors: { items: ["Data item pesanan tidak valid."] },
      message: "Beberapa field tidak valid. Gagal memperbarui pesanan.",
    };
  }

  const validatedFields = PesananForm.safeParse({
    pelanggan_id: formData.get("pelanggan_id"),
    antar_jemput_yt: formData.get("antar_jemput_yt"),
    antar_jemput_id: formData.get("antar_jemput_id"),
    metode_pembayaran: formData.get("metode_pembayaran"),
    jumlah_bayar: formData.get("jumlah_bayar"),
    catatan: formData.get("catatan"),
    items: rawItems,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const itemsErrors: string[] = [];
    validatedFields.error.issues.forEach((issue) => {
      if (issue.path[0] === "items") {
        const index = typeof issue.path[1] === "number" ? issue.path[1] + 1 : null;
        const field = issue.path[2] ? ` (${issue.path[2]})` : "";
        const text = index ? `Item ${index}${field}: ${issue.message}` : issue.message;
        if (!itemsErrors.includes(text)) itemsErrors.push(text);
      }
    });

    return {
      errors: {
        pelanggan_id: fieldErrors.pelanggan_id,
        antar_jemput_id: fieldErrors.antar_jemput_id,
        metode_pembayaran: fieldErrors.metode_pembayaran,
        jumlah_bayar: fieldErrors.jumlah_bayar,
        items: itemsErrors.length > 0 ? itemsErrors : undefined,
      },
      message: "Beberapa field tidak valid. Gagal memperbarui pesanan.",
    };
  }

  const { pelanggan_id, antar_jemput_yt, antar_jemput_id, metode_pembayaran, jumlah_bayar, catatan, items } =
    validatedFields.data;

  const now = new Date();
  const nowIso = now.toISOString();
  // Nomor pesanan tidak berubah saat edit (dibuat sekali saat create)
  const nomorPesanan = existingPesanan.nomor_pesanan ?? "";

  // Ambil data referensi untuk snapshot item pesanan (logika sama dengan create)
  const layananIds = items.map((item) => item.layanan_id);
  const layananRows = await sql<TabelLayanan[]>`
    SELECT
      l.id,
      l.nama_layanan,
      l.harga,
      tl.nama_tipe,
      d.nama_durasi,
      d.lama_durasi,
      t.nama_toko
    FROM layanan l
    JOIN tipe_layanan tl ON l.tipe_id = tl.id
    JOIN durasi d ON l.durasi_id = d.id
    LEFT JOIN toko t ON l.toko_id = t.id
    WHERE l.id = ANY(${layananIds})
  `;
  const layananMap = new Map(layananRows.map((row) => [row.id, row]));
  if (items.some((item) => !layananMap.has(item.layanan_id))) {
    return {
      errors: {
        items: [
          "Beberapa layanan tidak ditemukan. Silakan periksa kembali item pesanan.",
        ],
      },
      message: "Beberapa field tidak valid. Gagal memperbarui pesanan.",
    };
  }

  const parfumIds = items
    .map((item) => item.parfum_id)
    .filter((id): id is string => Boolean(id));
  const parfumRows =
    parfumIds.length > 0
      ? await sql<{ id: string; nama_parfum: string }[]>`
          SELECT id, nama_parfum FROM parfum WHERE id = ANY(${parfumIds})
        `
      : [];
  const parfumMap = new Map(
    parfumRows.map((row) => [row.id, row.nama_parfum]),
  );

  let namaAntarJemput: string | null = null;
  let biayaAntarJemput = 0;
  if (antar_jemput_yt === "ya" && antar_jemput_id) {
    const antarJemputRows = await sql<AntarJemput[]>`
      SELECT id, nama_antar_jemput, harga_antar_jemput
      FROM antar_jemput
      WHERE id = ${antar_jemput_id}
    `;
    if (antarJemputRows.length === 0) {
      return {
        errors: { antar_jemput_id: ["Layanan antar-jemput tidak ditemukan."] },
        message: "Beberapa field tidak valid. Gagal memperbarui pesanan.",
      };
    }
    namaAntarJemput = antarJemputRows[0].nama_antar_jemput;
    biayaAntarJemput = Number(antarJemputRows[0].harga_antar_jemput);
  }

  // Ambil data referensi diskon untuk item yang punya diskon
  const diskonIds = items
    .map((item) => item.diskon_id)
    .filter((id): id is string => Boolean(id));
  const diskonRows =
    diskonIds.length > 0
      ? await sql<Pick<Diskon, "id" | "tipe_diskon" | "nilai_diskon">[]>`
          SELECT id, tipe_diskon, nilai_diskon FROM diskon WHERE id = ANY(${diskonIds})
        `
      : [];
  const diskonMap = new Map(diskonRows.map((row) => [row.id, row]));

  // Hitung ulang subtotal, diskon, subtotal final & estimasi selesai per item
  // (perhitungan final di server, sama seperti saat create)
  const itemCalc = items.map((item, index) => {
    const layanan = layananMap.get(item.layanan_id)!;
    const subtotal = Number(layanan.harga) * item.jumlah;
    const diskon = item.diskon_id ? diskonMap.get(item.diskon_id) : undefined;
    const nilaiDiskon = diskon
      ? Math.min(
          Math.max(
            0,
            diskon.tipe_diskon === "Persentase"
              ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
              : Number(diskon.nilai_diskon),
          ),
          subtotal,
        )
      : 0;
    const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
    const estimasi =
      layanan.lama_durasi != null
        ? new Date(
            now.getTime() + Number(layanan.lama_durasi) * 60 * 60 * 1000,
          ).toISOString()
        : null;
    return {
      ...item,
      layanan,
      subtotal,
      diskonId: diskon ? item.diskon_id! : null,
      nilaiDiskon,
      subtotalFinal,
      estimasi,
      namaParfum: item.parfum_id ? parfumMap.get(item.parfum_id) ?? null : null,
      nomor: index + 1,
    };
  });

  const totalLayanan = itemCalc.reduce((sum, item) => sum + item.subtotal, 0);
  // Nilai diskon pesanan = total semua item_pesanan.nilai_diskon
  const nilaiDiskon = itemCalc.reduce((sum, item) => sum + item.nilaiDiskon, 0);

  const totalBayar = Math.max(0, totalLayanan + biayaAntarJemput - nilaiDiskon);
  const kurangBayar = Math.max(0, totalBayar - jumlah_bayar);
  const statusPembayaran =
    jumlah_bayar <= 0
      ? "belum_bayar"
      : jumlah_bayar >= totalBayar
        ? "lunas"
        : "DP";

  const estimasiList = itemCalc
    .map((item) => item.estimasi)
    .filter((estimasi): estimasi is string => Boolean(estimasi))
    .sort();
  const tglEstimasiSelesai =
    estimasiList.length > 0 ? estimasiList[estimasiList.length - 1] : null;

  // Status item pesanan baru mengikuti status pesanan saat ini:
  // - batal → semua item langsung 'batal'
  // - selesai/diambil → semua item mengikuti status tersebut dan
  //   tgl_selesai item diisi
  // - diproses → item baru 'diproses' seperti pesanan baru
  const statusPesananSaatIni = existingPesanan.status_pesanan;
  const statusItemBaru =
    statusPesananSaatIni === "batal" ||
    statusPesananSaatIni === "selesai" ||
    statusPesananSaatIni === "diambil"
      ? statusPesananSaatIni
      : "diproses";
  const tglSelesaiItemBaru =
    statusItemBaru === "selesai" || statusItemBaru === "diambil" ? nowIso : null;

  // Update pesanan + ganti seluruh item pesanan dalam satu transaksi.
  // Kolom workflow (nomor_pesanan, status_pesanan, tgl_pesanan, tgl_selesai,
  // tgl_diambil, created_at, kasir_id) dipertahankan; item pesanan diganti
  // total dan status item mengikuti status pesanan saat ini (bukan selalu
  // 'diproses') agar konsisten dengan updateStatusPesanan: pesanan batal/
  // selesai/diambil tetap menghasilkan item dengan status yang sama.
  try {
    await sql.begin(async (tx) => {
      await tx`
        UPDATE pesanan SET
          pelanggan_id = ${pelanggan_id},
          tgl_estimasi_selesai = ${tglEstimasiSelesai},
          nama_antar_jemput_snapshot = ${namaAntarJemput},
          total_layanan = ${totalLayanan},
          biaya_antar_jemput = ${biayaAntarJemput},
          nilai_diskon = ${nilaiDiskon},
          total_bayar = ${totalBayar},
          status_pembayaran = ${statusPembayaran},
          metode_pembayaran = ${metode_pembayaran ?? null},
          jumlah_bayar = ${jumlah_bayar},
          kurang_bayar = ${kurangBayar},
          catatan = ${catatan || null},
          last_update = ${nowIso},
          update_by = ${userId},
          antar_jemput_yt = ${antar_jemput_yt}
        WHERE id = ${id}
      `;

      await tx`DELETE FROM item_pesanan WHERE pesanan_id = ${id}`;

      for (const item of itemCalc) {
        await tx`
          INSERT INTO item_pesanan (
            pesanan_id, nama_parfum_snapshot, nomor_item_pesanan, nama_layanan_snapshot,
            tipe_layanan_snapshot, durasi_snapshot, harga_satuan, jumlah, satuan, subtotal,
            catatan_item, status_item, diskon_id, nilai_diskon, tgl_item_pesanan,
            nilai_durasi, tgl_estimasi_selesai, tgl_selesai, subtotal_final,
            created_at, last_update, update_by
          ) VALUES (
            ${id}, ${item.namaParfum}, ${nomorPesanan + "-" + item.nomor}, ${item.layanan.nama_layanan},
            ${item.layanan.nama_tipe}, ${item.layanan.nama_durasi}, ${item.layanan.harga}, ${item.jumlah}, ${item.satuan}, ${item.subtotal},
            null, ${statusItemBaru}, ${item.diskonId}, ${item.nilaiDiskon}, ${nowIso},
            ${item.layanan.lama_durasi ?? null}, ${item.estimasi}, ${tglSelesaiItemBaru}, ${item.subtotalFinal},
            ${nowIso}, ${nowIso}, ${userId}
          )
        `;
      }

      // Catat transaksi keuangan jika jumlah_bayar berubah (Rule 4)
      const jumlahBayarSebelumnya = Number(existingPesanan.jumlah_bayar) || 0;
      const jumlahBayarSekarang = Number(jumlah_bayar) || 0;
      const selisih = jumlahBayarSekarang - jumlahBayarSebelumnya;

      if (existingPesanan.status_pesanan !== "batal" && selisih !== 0) {
        if (selisih > 0) {
          // Tambahan pembayaran
          await insertTransaksiKeuangan({
            tx,
            nama_transaksi: "Pembayaran",
            tipe_transaksi: (metode_pembayaran as TipeTransaksi) ?? null,
            nilai_debet: selisih,
            pesanan_id: id,
            toko_id: existingPesanan.toko_id,
            keterangan: existingPesanan.nomor_pesanan,
            update_by: userId,
          });
        } else {
          // Pengurangan pembayaran
          await insertTransaksiKeuangan({
            tx,
            nama_transaksi: "Pengurangan Pembayaran",
            tipe_transaksi: (metode_pembayaran as TipeTransaksi) ?? null,
            nilai_kredit: Math.abs(selisih),
            pesanan_id: id,
            toko_id: existingPesanan.toko_id,
            keterangan: existingPesanan.nomor_pesanan,
            update_by: userId,
          });
        }
      }

    });
  } catch (error) {
    console.error("Database Error: Gagal memperbarui pesanan.", error);
    return {
      message: "Database Error: Gagal memperbarui pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(`/laundry/pesanan/${id}/detail`);
  redirect("/laundry/pesanan");
}

export async function deletePesanan(id: string): Promise<DeletePesananResult> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  // Pastikan pesanan ada dan milik toko yang sedang dipilih
  const existingPesanan = await fetchPesananById(id);
  if (!existingPesanan || existingPesanan.toko_id !== selectedToko) {
    return {
      success: false,
      message: "Pesanan tidak ditemukan. Gagal menghapus pesanan.",
    };
  }

  // Pesanan yang sudah selesai/diambil tidak boleh dihapus (riwayat transaksi)
  if (
    existingPesanan.status_pesanan === "selesai" ||
    existingPesanan.status_pesanan === "diambil"
  ) {
    const label =
      existingPesanan.status_pesanan === "selesai" ? "Selesai" : "Diambil";
    return {
      success: false,
      message: `Pesanan berstatus ${label} tidak dapat dihapus.`,
    };
  }

  // Pesanan yang sudah ada pembayaran tidak boleh dihapus
  if (
    Number(existingPesanan.jumlah_bayar) > 0 ||
    existingPesanan.status_pembayaran === "DP" ||
    existingPesanan.status_pembayaran === "lunas"
  ) {
    return {
      success: false,
      message:
        "Pesanan yang sudah ada pembayaran tidak dapat dihapus. Gunakan status 'Batal' jika transaksi dibatalkan.",
    };
  }

  try {
    await sql.begin(async (tx) => {
      // Catat transaksi keuangan jika ada pembayaran (Rule 2)
      // Validasi mencegah hapus pesanan yang sudah ada pembayaran,
      // tapi kode ini tetap ditambahkan sesuai requirement.
      if (
        existingPesanan.status_pesanan !== "batal" &&
        Number(existingPesanan.jumlah_bayar) > 0
      ) {
        await insertTransaksiKeuangan({
          tx,
          nama_transaksi: "Penghapusan Pesanan",
          tipe_transaksi: (existingPesanan.metode_pembayaran as TipeTransaksi) ?? null,
          nilai_kredit: Number(existingPesanan.jumlah_bayar),
          pesanan_id: id,
          toko_id: existingPesanan.toko_id,
          keterangan: existingPesanan.nomor_pesanan,
          update_by: null,
        });
      }
      await tx`DELETE FROM item_pesanan WHERE pesanan_id = ${id}`;
      await tx`DELETE FROM pesanan WHERE id = ${id}`;
    });
  } catch (error) {
    console.error("Database Error: Gagal menghapus pesanan.", error);
    return {
      success: false,
      message: "Database Error: Gagal menghapus pesanan.",
    };
  }

  revalidatePath("/laundry/pesanan");
  return { success: true };
}

// Pembungkus fetch untuk pagination (dipanggil dari UI via barrel actions).
export async function fetchMorePesanan(
  query: string,
  page: number,
  statusPesanan?: string,
  statusPembayaran?: string,
) {
  await getCurrentUser();
  return await fetchFilteredPesanan(query, page, statusPesanan, statusPembayaran);
}

export async function fetchMoreItemPesanan(pesananId: string, page: number) {
  await getCurrentUser();
  return await fetchItemPesananByPesananId(pesananId, page);
}

// Seluruh item pesanan untuk isi struk/WA. Dipanggil dari helper browser
// (app/lib/struk-wa.ts) saat tombol WhatsApp / Cetak Struk diklik, karena data
// item tidak ikut dimuat di list pesanan. Tanpa filter status_item agar jumlah
// item cocok dengan total_bayar yang dihitung recalcPesananTotals (semua item).
export async function fetchItemPesananForStruk(pesananId: string) {
  await getCurrentUser();
  return await fetchAllItemPesananByPesananId(pesananId);
}





