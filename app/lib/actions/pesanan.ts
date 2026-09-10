"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredPesanan, fetchItemPesananByPesananId } from "../data/pesanan";
import type { TabelLayanan, Diskon, AntarJemput } from "../definitions";
import type { State } from "./types";

const PesananItemSchema = z.object({
  layanan_id: z.string().min(1, { message: "Layanan wajib dipilih." }),
  jumlah: z.coerce.number().gt(0, { message: "Jumlah harus lebih dari 0." }),
  satuan: z.enum(["kg", "pcs"], { message: "Satuan wajib dipilih." }),
  parfum_id: z.string().optional(),
});

const CreatePesananForm = z
  .object({
    pelanggan_id: z.string().min(1, { message: "Pelanggan wajib dipilih." }),
    antar_jemput_yt: z.enum(["ya", "tidak"], {
      message: "Antar jemput wajib dipilih.",
    }),
    antar_jemput_id: z.string().optional(),
    diskon_id: z.string().optional(),
    metode_pembayaran: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["tunai", "transfer", "qris"]).optional(),
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

  const validatedFields = CreatePesananForm.safeParse({
    pelanggan_id: formData.get("pelanggan_id"),
    antar_jemput_yt: formData.get("antar_jemput_yt"),
    antar_jemput_id: formData.get("antar_jemput_id"),
    diskon_id: formData.get("diskon_id"),
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
        jumlah_bayar: fieldErrors.jumlah_bayar,
        items: itemsErrors.length > 0 ? itemsErrors : undefined,
      },
      message: "Beberapa field tidak valid. Gagal menambah pesanan.",
    };
  }

  const { pelanggan_id, antar_jemput_yt, antar_jemput_id, diskon_id, metode_pembayaran, jumlah_bayar, catatan, items } =
    validatedFields.data;

  const now = new Date();
  const nowIso = now.toISOString();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const nomorPesanan = `PSN-${stamp}`;
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
    WHERE l.id IN (${sql(layananIds)})
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
          SELECT id, nama_parfum FROM parfum WHERE id IN (${sql(parfumIds)})
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

  // Hitung subtotal & estimasi selesai per item (berdasarkan durasi layanan)
  const itemCalc = items.map((item, index) => {
    const layanan = layananMap.get(item.layanan_id)!;
    const subtotal = Number(layanan.harga) * item.jumlah;
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
      estimasi,
      namaParfum: item.parfum_id ? parfumMap.get(item.parfum_id) ?? null : null,
      nomor: index + 1,
    };
  });

  const totalLayanan = itemCalc.reduce((sum, item) => sum + item.subtotal, 0);

  // Nilai diskon: Persentase dihitung dari total layanan, Nominal langsung dipakai
  let nilaiDiskon = 0;
  if (diskon_id) {
    const diskonRows = await sql<Diskon[]>`
      SELECT id, nama_diskon, tipe_diskon, nilai_diskon
      FROM diskon
      WHERE id = ${diskon_id}
    `;
    if (diskonRows.length > 0) {
      const diskon = diskonRows[0];
      const nilai =
        diskon.tipe_diskon === "Persentase"
          ? Math.round((Number(diskon.nilai_diskon) / 100) * totalLayanan)
          : Number(diskon.nilai_diskon);
      nilaiDiskon = Math.max(0, Math.min(nilai, totalLayanan + biayaAntarJemput));
    }
  }

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
          ${selectedToko}, ${pelanggan_id}, ${userId}, ${nomorPesanan}, 'baru',
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
            ${pesananId}, ${item.namaParfum}, ${String(item.nomor)}, ${item.layanan.nama_layanan},
            ${item.layanan.nama_tipe}, ${item.layanan.nama_durasi}, ${item.layanan.harga}, ${item.jumlah}, ${item.satuan}, ${item.subtotal},
            null, 'diproses', null, null, ${nowIso},
            ${item.layanan.lama_durasi ?? null}, ${item.estimasi}, null, ${item.subtotal},
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

export async function deletePesanan(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM pesanan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Pesanan.");
  }
  revalidatePath("/laundry/pesanan");
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
