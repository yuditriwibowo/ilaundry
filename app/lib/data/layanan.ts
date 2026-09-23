import { cookies } from "next/headers";
import { sql } from "../db";
import {
  Layanan,
  TabelLayanan,
  DetailLayanan,
} from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchTipeLayanan() {
  try {
    const data = await sql`SELECT id, nama_tipe as nama FROM tipe_layanan ORDER BY nama_tipe ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch tipe layanan.");
  }
}

export async function fetchFilteredLayanan(
  query: string,
  currentPage: number,
  tipeId?: string,
  durasiNama?: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const layanan = await sql<TabelLayanan[]>`
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
      WHERE
        ${selectedToko ? sql`l.toko_id = ${selectedToko}` : sql`1=0`} AND
        ${tipeId ? sql`l.tipe_id = ${tipeId}` : sql`1=1`} AND
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`}
        ${query?.trim() ? sql`AND (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})` : sql``}
      ORDER BY l.nama_layanan ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return layanan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch layanan.");
  }
}

export async function fetchLayananPages(query: string, tipeId?: string, durasiNama?: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM layanan l
      JOIN tipe_layanan tl ON l.tipe_id = tl.id
      JOIN durasi d ON l.durasi_id = d.id
      WHERE
        ${selectedToko ? sql`l.toko_id = ${selectedToko}` : sql`1=0`} AND
        ${tipeId ? sql`l.tipe_id = ${tipeId}` : sql`1=1`} AND
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`}
        ${query?.trim() ? sql`AND (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})` : sql``}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman layanan.");
  }
}

export async function fetchLayananById(id: string) {
  try {
    const data = await sql<Layanan[]>`
      SELECT * FROM layanan
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch layanan.");
  }
}

export async function fetchLayananDetailById(id: string) {
  try {
    const data = await sql<DetailLayanan[]>`
      SELECT
        l.id,
        l.nama_layanan,
        l.harga,
        tl.nama_tipe,
        d.nama_durasi,
        d.lama_durasi,
        t.nama_toko,
        l.created_at,
        l.last_update
      FROM layanan l
      JOIN tipe_layanan tl ON l.tipe_id = tl.id
      JOIN durasi d ON l.durasi_id = d.id
      LEFT JOIN toko t ON l.toko_id = t.id
      WHERE l.id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch layanan.");
  }
}

// ==== Opsi untuk form tambah pesanan ====

export async function fetchLayananForForm() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const data = await sql<TabelLayanan[]>`
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
      WHERE
        ${selectedToko ? sql`l.toko_id = ${selectedToko}` : sql`1=0`}
      ORDER BY l.nama_layanan ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data layanan.");
  }
}

/* =========================================================================
 * Analisa Layanan (per periode)
 * ========================================================================= */

/** Tanggal (YYYY-MM-DD) berikutnya dari `tgl`. */
function nextDay(tgl: string): string {
  const [y, m, d] = tgl.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** Batas bawah periode (mulai, 00:00 WIB) sebagai timestamptz ISO. */
function startTs(mulai: string): string {
  return `${mulai}T00:00:00+07:00`;
}

/** Batas atas periode (eksklusif, besok 00:00 WIB) sebagai timestamptz ISO. */
function endTs(sampai: string): string {
  return `${nextDay(sampai)}T00:00:00+07:00`;
}

/** Kunci opsi urutan Analisa Layanan (dipakai di URL `?urutkan=..`). */
export type AnalisaLayananUrutan =
  | "nilai-tertinggi"
  | "nilai-terendah"
  | "kuantitas-tertinggi"
  | "kuantitas-terendah"
  | "nama-layanan"
  | "nama-durasi";

/** Satu baris peringkat layanan dalam periode terpilih. */
export type AnalisaLayananItem = {
  namaLayanan: string;
  tipe: string | null;
  durasi: string | null;
  // Satuan kuantitas item ('kg' / 'pcs' / 'm').
  satuan: string;
  // Nilai penjualan layanan (subtotal item setelah diskon).
  nilai: number;
  // Total kuantitas layanan (jumlah item).
  kuantitas: number;
};

export type AnalisaLayananPeriode = {
  outlet: string | null;
  // Katalog layanan toko terpilih (tanpa filter periode, konsisten dengan
  // "Total Pelanggan" pada Analisa Pelanggan): jumlah durasi & layanan.
  jenisDurasi: number;
  jenisLayanan: number;
  // Peringkat layanan yang terjual dalam periode (urutan sesuai `urutkan`).
  items: AnalisaLayananItem[];
};

const ANALISA_LAYANAN_KESELONGAN: AnalisaLayananPeriode = {
  outlet: null,
  jenisDurasi: 0,
  jenisLayanan: 0,
  items: [],
};

/** Whitelist kunci urutan — kunci tak dikenal kembali ke default. */
export function resolveUrutanLayanan(
  urutan?: string,
): AnalisaLayananUrutan {
  const re = /^(nilai-tertinggi|nilai-terendah|kuantitas-tertinggi|kuantitas-terendah|nama-layanan|nama-durasi)$/;
  return urutan && re.test(urutan)
    ? (urutan as AnalisaLayananUrutan)
    : "nilai-tertinggi";
}

/**
 * Analisa Layanan per periode & per toko (dari cookie `selected_toko`).
 * Zona waktu Asia/Jakarta, pola sama dengan fetchAnalisaPelangganPeriode.
 *
 * - Peringkat dihitung dari item_pesanan periode terpilih dikelompokkan per
 *   (nama, tipe, durasi, satuan) layanan; pesanan & item batal dikecualikan
 *   (konsisten dengan Analisa Pelanggan & Laporan Pesanan).
 * - Nilai = subtotal item setelah diskon (subtotal_final, fallback subtotal).
 * - Kuantitas = SUM(item_pesanan.jumlah) per satuan ('kg' / 'pcs' / 'm').
 * - Jenis Durasi & Jenis Layanan dihitung dari katalog layanan toko terpilih
 *   (semua waktu, tanpa filter periode).
 * - `urutkan` menentukan ORDER BY peringkat (nilai, kuantitas, atau nama).
 */
export async function fetchAnalisaLayananPeriode(
  mulai: string,
  sampai: string,
  urutkan: AnalisaLayananUrutan = "nilai-tertinggi",
): Promise<AnalisaLayananPeriode> {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) return ANALISA_LAYANAN_KESELONGAN;

  const awal = startTs(mulai);
  const akhir = endTs(sampai);

  // ORDER BY peringkat sesuai kunci `urutkan` (tie-break nama A-Z).
  const orderBy =
    urutkan === "nilai-terendah"
      ? sql`i.nilai ASC, i.nama_layanan ASC`
      : urutkan === "kuantitas-tertinggi"
        ? sql`i.kuantitas DESC, i.nama_layanan ASC`
        : urutkan === "kuantitas-terendah"
          ? sql`i.kuantitas ASC, i.nama_layanan ASC`
          : urutkan === "nama-layanan"
            ? sql`i.nama_layanan ASC`
            : urutkan === "nama-durasi"
              ? sql`i.durasi ASC, i.nama_layanan ASC`
              : sql`i.nilai DESC, i.nama_layanan ASC`;

  try {
    // FROM (SELECT 1) LEFT JOIN item: saat tidak ada item dalam periode,
    // informasi outlet/jenis tetap dikembalikan dalam satu baris kosong.
    const data = await sql`
      WITH item AS (
        SELECT
          ip.nama_layanan_snapshot AS nama_layanan,
          ip.tipe_layanan_snapshot AS tipe,
          ip.durasi_snapshot AS durasi,
          ip.satuan,
          SUM(COALESCE(ip.subtotal_final, ip.subtotal)) AS nilai,
          SUM(ip.jumlah) AS kuantitas
        FROM public.item_pesanan AS ip
        JOIN public.pesanan AS p ON p.id = ip.pesanan_id
        WHERE p.toko_id = ${selectedToko}
          AND p.tgl_pesanan >= ${awal}::timestamptz
          AND p.tgl_pesanan < ${akhir}::timestamptz
          AND p.status_pesanan <> 'batal'
          AND ip.status_item <> 'batal'
        GROUP BY 1, 2, 3, 4
      )
      SELECT
        (SELECT nama_toko FROM public.toko WHERE id::text = ${selectedToko}) AS outlet,
        (SELECT COUNT(DISTINCT l.durasi_id) FROM public.layanan AS l
          WHERE l.toko_id = ${selectedToko}) AS jenis_durasi,
        (SELECT COUNT(*) FROM public.layanan AS l
          WHERE l.toko_id = ${selectedToko}) AS jenis_layanan,
        i.nama_layanan, i.tipe, i.durasi, i.satuan, i.nilai, i.kuantitas
      FROM (SELECT 1) AS one
      LEFT JOIN item AS i ON TRUE
      ORDER BY ${orderBy}
    `;

    const row = data[0];

    return {
      outlet: (row?.outlet as string | null) ?? null,
      jenisDurasi: Number(row?.jenis_durasi ?? 0),
      jenisLayanan: Number(row?.jenis_layanan ?? 0),
      items: data
        .filter((r) => r.nama_layanan !== null)
        .map((r) => ({
          namaLayanan: r.nama_layanan as string,
          tipe: (r.tipe as string | null) ?? null,
          durasi: (r.durasi as string | null) ?? null,
          satuan: (r.satuan as string | null) ?? "",
          nilai: Number(r.nilai ?? 0),
          kuantitas: Number(r.kuantitas ?? 0),
        })),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil analisa layanan per periode.");
  }
}

