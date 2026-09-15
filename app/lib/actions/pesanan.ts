"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import {
  fetchFilteredPesanan,
  fetchItemPesananByPesananId,
  fetchAllItemPesananByPesananId,
  fetchPesananById,
} from "../data/pesanan";
import type { TabelLayanan, Diskon, AntarJemput, TabelPesanan } from "../definitions";
import type { State } from "./types";

const PesananItemSchema = z.object({
  layanan_id: z.string().min(1, { message: "Layanan wajib dipilih." }),
  jumlah: z.coerce.number().gt(0, { message: "Jumlah harus lebih dari 0." }),
  satuan: z.enum(["kg", "pcs", "m"], { message: "Satuan wajib dipilih." }),
  parfum_id: z.string().optional(),
  diskon_id: z.string().optional(),
});

// Schema dipakai bersama oleh createPesanan & updatePesanan
// (payload form keduanya identik).
const PesananForm = z
  .object({
    pelanggan_id: z.string().min(1, { message: "Pelanggan wajib dipilih." }),
    antar_jemput_yt: z.enum(["ya", "tidak"], {
      message: "Antar jemput wajib dipilih.",
    }),
    antar_jemput_id: z.string().optional(),
    metode_pembayaran: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["tunai", "non_tunai"]).optional(),
    ),
    jumlah_bayar: z.coerce
      .number()
      .min(0, { message: "Jumlah bayar tidak boleh negatif." }),
    catatan: z.string().optional(),
    items: z
      .array(PesananItemSchema)
      .min(1, { message: "Minimal harus ada 1 item layanan." }),
  })
  .superRefine((data, ctx) => {
    if (data.antar_jemput_yt === "ya" && !data.antar_jemput_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["antar_jemput_id"],
        message: "Layanan antar-jemput wajib dipilih.",
      });
    }
    // Jika jumlah bayar diisi (> 0), metode pembayaran wajib dipilih
    if (data.jumlah_bayar > 0 && !data.metode_pembayaran) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["metode_pembayaran"],
        message: "Metode pembayaran wajib dipilih karena jumlah bayar sudah diisi.",
      });
    }
  });

export async function createPesanan(prevState: State, formData: FormData): Promise<State> {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;
  const userId = cookieStore.get("user_id")?.value || null;

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
  const userId = cookieStore.get("user_id")?.value || null;

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

// Hasil delete pesanan. Alasan penolakan dikembalikan sebagai pesan
// (bukan throw) agar UI bisa menampilkannya apa adanya tanpa error 500.
export type DeletePesananResult = {
  success: boolean;
  message?: string;
};

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

// Hasil update status/pembayaran pesanan. Pola sama dengan deletePesanan:
// penolakan dikembalikan sebagai message (bukan throw) agar UI bisa
// menampilkannya apa adanya di modal tanpa error 500 di production.
export type UpdatePesananResult = {
  success: boolean;
  message?: string;
  // Baris pesanan terbaru setelah update, untuk refresh data di klien.
  pesanan?: TabelPesanan;
};

const StatusPesananSchema = z.enum(["diproses", "selesai", "diambil", "batal"]);
const MetodePembayaranSchema = z.enum(["tunai", "non_tunai"]);

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
  const userId = cookieStore.get("user_id")?.value || null;

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
  const userId = cookieStore.get("user_id")?.value || null;

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

// ===== Tambah item pesanan (dari halaman detail pesanan) =====
// Hanya menambah SATU item pesanan per submit. Snapshot layanan/parfum/diskon
// diambil dari database (tidak dipercaya dari klien), lalu kolom biaya pesanan
// dihitung ulang dari SELURUH item agar total di list & detail tetap sinkron
// (rumus sama dengan createPesanan/updatePesanan).
const ItemPesananFormSchema = z.object({
  layanan_id: z.string().min(1, { message: "Layanan wajib dipilih." }),
  jumlah: z.coerce.number().gt(0, { message: "Jumlah harus lebih dari 0." }),
  satuan: z.enum(["kg", "pcs", "m"], { message: "Satuan wajib dipilih." }),
  parfum_id: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  diskon_id: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  catatan_item: z.string().optional(),
});

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

  // Snapshot layanan (join tipe & durasi) — sumber harga yang sah
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
    WHERE l.id = ${layanan_id}
  `;
  const layanan = layananRows[0];
  if (!layanan) {
    return {
      errors: {
        layanan_id: [
          "Layanan tidak ditemukan. Silakan periksa kembali item pesanan.",
        ],
      },
      message: "Beberapa field tidak valid. Gagal menambah item pesanan.",
    };
  }

  let namaParfum: string | null = null;
  if (parfum_id) {
    const parfumRows = await sql<{ id: string; nama_parfum: string }[]>`
      SELECT id, nama_parfum FROM parfum WHERE id = ${parfum_id}
    `;
    namaParfum = parfumRows[0]?.nama_parfum ?? null;
  }

  // Perhitungan diskon per item (rumus sama dengan create/update pesanan):
  // - Persentase: (diskon.nilai_diskon / 100) * subtotal item
  // - Nominal: diskon.nilai_diskon langsung dipakai
  // Dibatasi maksimal subtotal item agar subtotal_final tidak negatif.
  const subtotal = Number(layanan.harga) * jumlah;
  let diskonId: string | null = null;
  let nilaiDiskon = 0;
  if (diskon_id) {
    const diskonRows = await sql<
      Pick<Diskon, "id" | "tipe_diskon" | "nilai_diskon">[]
    >`
      SELECT id, tipe_diskon, nilai_diskon FROM diskon WHERE id = ${diskon_id}
    `;
    const diskon = diskonRows[0];
    if (diskon) {
      diskonId = diskon.id;
      nilaiDiskon = Math.min(
        Math.max(
          0,
          diskon.tipe_diskon === "Persentase"
            ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
            : Number(diskon.nilai_diskon),
        ),
        subtotal,
      );
    }
  }
  const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
  const estimasi =
    layanan.lama_durasi != null
      ? new Date(
          now.getTime() + Number(layanan.lama_durasi) * 60 * 60 * 1000,
        ).toISOString()
      : null;

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

      const totals = await tx<
        {
          total_layanan: string;
          nilai_diskon: string;
          tgl_estimasi_selesai: string | Date | null;
        }[]
      >`
        SELECT
          COALESCE(SUM(subtotal), 0) AS total_layanan,
          COALESCE(SUM(nilai_diskon), 0) AS nilai_diskon,
          MAX(tgl_estimasi_selesai) AS tgl_estimasi_selesai
        FROM item_pesanan
        WHERE pesanan_id = ${pesananId}
      `;
      const totalLayanan = Number(totals[0]?.total_layanan ?? 0);
      const totalDiskon = Number(totals[0]?.nilai_diskon ?? 0);
      const estimasiRaw = totals[0]?.tgl_estimasi_selesai ?? null;
      const estimasiDate = estimasiRaw ? new Date(estimasiRaw) : null;
      const tglEstimasiSelesai =
        estimasiDate && !Number.isNaN(estimasiDate.getTime())
          ? estimasiDate.toISOString()
          : null;

      // Biaya antar jemput & jumlah bayar tidak diubah aksi ini; status
      // pembayaran & kurang bayar dihitung ulang dari total_bayar yang baru.
      const biayaAntarJemput = Number(existingPesanan.biaya_antar_jemput) || 0;
      const jumlahBayar = Number(existingPesanan.jumlah_bayar) || 0;
      const totalBayar = Math.max(0, totalLayanan + biayaAntarJemput - totalDiskon);
      const kurangBayar = Math.max(0, totalBayar - jumlahBayar);
      const statusPembayaran =
        jumlahBayar <= 0
          ? "belum_bayar"
          : jumlahBayar >= totalBayar
            ? "lunas"
            : "DP";

      await tx`
        UPDATE pesanan SET
          total_layanan = ${totalLayanan},
          nilai_diskon = ${totalDiskon},
          total_bayar = ${totalBayar},
          status_pembayaran = ${statusPembayaran},
          kurang_bayar = ${kurangBayar},
          tgl_estimasi_selesai = ${tglEstimasiSelesai},
          last_update = ${nowIso},
          update_by = ${userId}
        WHERE id = ${pesananId}
      `;
    });
  } catch (error) {
    console.error("Database Error: Gagal menambah item pesanan.", error);
    return { message: "Database Error: Gagal menambah item pesanan." };
  }

  revalidatePath("/laundry/pesanan");
  revalidatePath(detailHref);
  redirect(detailHref);
}

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

export async function deleteItemPesanan(id: string, pesananId: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM public.item_pesanan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Item Pesanan.");
  }
  revalidatePath(`/laundry/pesanan/${pesananId}/detail`);
  revalidatePath("/laundry/pesanan");
}
