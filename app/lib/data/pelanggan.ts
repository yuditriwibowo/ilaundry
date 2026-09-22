import { cookies } from "next/headers";
import { sql } from "../db";
import { Pelanggan } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

// Helper: ambil toko aktif dari cookie selected_toko.
// Pola sama dengan data/layanan.ts & data/usertoko.ts.
async function getSelectedToko() {
  const cookieStore = await cookies();
  return cookieStore.get("selected_toko")?.value;
}

export async function fetchFilteredPelanggan(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const hasQuery = Boolean(query?.trim());
  const selectedToko = await getSelectedToko();

  try {
    const pelanggan = await sql<Pelanggan[]>`
      SELECT
        id,
        nama,
        no_hp,
        alamat,
        email,
        image_url,
        tgl_daftar
      FROM pelanggan
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=0`}
        ${hasQuery ? sql`AND (
          nama ILIKE ${`%${query}%`} OR
          no_hp ILIKE ${`%${query}%`} OR
          alamat ILIKE ${`%${query}%`} OR
          email ILIKE ${`%${query}%`})` : sql``}
      ORDER BY tgl_daftar DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return pelanggan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pelanggan.");
  }
}

export async function fetchPelangganById(id: string) {
  try {
    const data = await sql<Pelanggan[]>`
      SELECT * FROM pelanggan
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pelanggan.");
  }
}

export async function fetchPelangganPages(query: string) {
  const hasQuery = Boolean(query?.trim());
  const selectedToko = await getSelectedToko();
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM pelanggan
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=0`}
        ${hasQuery ? sql`AND (
          nama ILIKE ${`%${query}%`} OR
          no_hp ILIKE ${`%${query}%`} OR
          COALESCE(alamat, '') ILIKE ${`%${query}%`} OR
          COALESCE(email, '') ILIKE ${`%${query}%`} OR
          tgl_daftar::text ILIKE ${`%${query}%`})` : sql``}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman pelanggan.");
  }
}

// ==== Opsi untuk form tambah pesanan ====

export async function fetchPelangganForForm() {
  const selectedToko = await getSelectedToko();
  try {
    const data = await sql<Pick<Pelanggan, "id" | "nama" | "no_hp">[]>`
      SELECT id, nama, no_hp
      FROM pelanggan
      WHERE ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=0`}
      ORDER BY nama ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pelanggan.");
  }
}

/* =========================================================================
 * Analisa Pelanggan (per periode)
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

export type AnalisaPelangganPeriode = {
  outlet: string | null;
  // Pelanggan yang mendaftar (tgl_daftar) dalam periode.
  pelangganBaru: number;
  // Seluruh pelanggan toko terpilih (tanpa filter periode).
  totalPelanggan: number;
  // Pelanggan dengan jumlah pesanan terbanyak dalam periode
  // (pesanan batal dikecualikan; null jika tidak ada pesanan).
  pelangganTerbanyakPesanan: { nama: string | null; jumlah: number } | null;
  // Pelanggan dengan nilai pesanan terbesar dalam periode
  // (pesanan batal dikecualikan; null jika tidak ada pesanan).
  pelangganNilaiPesananTerbesar: { nama: string | null; nilai: number } | null;
};

const ANALISA_KESELONGAN: AnalisaPelangganPeriode = {
  outlet: null,
  pelangganBaru: 0,
  totalPelanggan: 0,
  pelangganTerbanyakPesanan: null,
  pelangganNilaiPesananTerbesar: null,
};

/**
 * Ringkasan Analisa Pelanggan per periode & per toko (dari cookie
 * `selected_toko`). Zona waktu Asia/Jakarta, pola sama dengan
 * fetchLaporanKasPeriode / fetchLaporanPesananPeriode.
 *
 * - Pelanggan Baru  -> pelanggan dengan tgl_daftar dalam rentang periode.
 * - Total Pelanggan -> seluruh pelanggan toko terpilih (semua waktu).
 * - Pelanggan dengan jumlah pesanan terbanyak & pelanggan dengan nilai
 *   pesanan terbesar dihitung dari pesanan periode terpilih; pesanan batal
 *   dikecualikan (konsisten dengan Laporan Pesanan).
 */
export async function fetchAnalisaPelangganPeriode(
  mulai: string,
  sampai: string,
): Promise<AnalisaPelangganPeriode> {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) return ANALISA_KESELONGAN;

  const awal = startTs(mulai);
  const akhir = endTs(sampai);

  try {
    const data = await sql`
      WITH agg AS (
        SELECT pl.id AS pelanggan_id, pl.nama AS nama,
               COUNT(*) AS jumlah,
               COALESCE(SUM(p.total_bayar), 0) AS nilai
        FROM public.pesanan AS p
        JOIN public.pelanggan AS pl ON pl.id = p.pelanggan_id
        WHERE p.toko_id = ${selectedToko}
          AND p.tgl_pesanan >= ${awal}::timestamptz
          AND p.tgl_pesanan < ${akhir}::timestamptz
          AND p.status_pesanan <> 'batal'
        GROUP BY pl.id, pl.nama
      )
      SELECT
        (SELECT nama_toko FROM public.toko WHERE id::text = ${selectedToko}) AS outlet,
        (SELECT COUNT(*) FROM public.pelanggan
          WHERE toko_id = ${selectedToko}
            AND tgl_daftar >= ${awal}::timestamptz
            AND tgl_daftar < ${akhir}::timestamptz) AS pelanggan_baru,
        (SELECT COUNT(*) FROM public.pelanggan
          WHERE toko_id = ${selectedToko}) AS total_pelanggan,
        -- Pelanggan dengan jumlah pesanan terbanyak (nama penentu tie-break).
        (SELECT nama FROM agg ORDER BY jumlah DESC, nama ASC LIMIT 1) AS nama_jumlah_terbanyak,
        (SELECT MAX(jumlah) FROM agg) AS jumlah_terbanyak,
        -- Pelanggan dengan nilai pesanan terbesar (nama penentu tie-break).
        (SELECT nama FROM agg ORDER BY nilai DESC, nama ASC LIMIT 1) AS nama_nilai_terbesar,
        (SELECT MAX(nilai) FROM agg) AS nilai_terbesar
    `;

    const row = data[0];
    const jumlahTerbanyak = Number(row?.jumlah_terbanyak ?? 0);
    const nilaiTerbesar = Number(row?.nilai_terbesar ?? 0);

    return {
      outlet: (row?.outlet as string | null) ?? null,
      pelangganBaru: Number(row?.pelanggan_baru ?? 0),
      totalPelanggan: Number(row?.total_pelanggan ?? 0),
      pelangganTerbanyakPesanan:
        jumlahTerbanyak > 0
          ? {
              nama: (row?.nama_jumlah_terbanyak as string | null) ?? null,
              jumlah: jumlahTerbanyak,
            }
          : null,
      pelangganNilaiPesananTerbesar:
        nilaiTerbesar > 0
          ? {
              nama: (row?.nama_nilai_terbesar as string | null) ?? null,
              nilai: nilaiTerbesar,
            }
          : null,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil analisa pelanggan per periode.");
  }
}

