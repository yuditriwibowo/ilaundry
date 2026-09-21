import { cookies } from "next/headers";
import { sql } from "../db";
import { ITEMS_PER_PAGE } from "./constants";
import { TransaksiKeuangan } from "../definitions";

/**
 * Data layer Laporan Kas (mutasi kas per periode & per toko).
 *
 * Sumber data: tabel transaksi_keuangan (tabel yang sama dipakai untuk
 * pembayaran pesanan dan mutasi Penambahan/Pengurangan Kas):
 * - Pendapatan      -> baris dengan pesanan_id NOT NULL (debet - kredit)
 * - Penambahan Kas  -> nama_transaksi = 'Penambahan Kas' (debet)
 * - Pengurangan Kas -> nama_transaksi = 'Pengurangan Kas' (kredit)
 * - Saldo awal      -> net (debet - kredit) seluruh transaksi sebelum periode
 * - Saldo akhir     -> saldo awal + pendapatan + penambahan - pengurangan
 *
 * Semua query difilter toko_id dari cookie `selected_toko` dan rentang
 * waktu_transaksi dalam zona waktu Asia/Jakarta.
 */

export type SaldoPerTipe = {
  total: number;
  tunai: number;
  nonTunai: number;
};

export type LaporanKasPeriode = {
  outlet: string | null;
  saldoAwal: SaldoPerTipe;
  pendapatan: SaldoPerTipe;
  penambahanKas: SaldoPerTipe;
  penguranganKas: SaldoPerTipe;
  saldoAkhir: SaldoPerTipe;
};

// Baris daftar transaksi keuangan untuk laporan kas (dilengkapi nomor pesanan).
export type BarisLaporanKas = Pick<
  TransaksiKeuangan,
  | "id"
  | "waktu_transaksi"
  | "nama_transaksi"
  | "tipe_transaksi"
  | "nilai_debet"
  | "nilai_kredit"
  | "keterangan"
  | "pesanan_id"
> & {
  nomor_pesanan: string | null;
};

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

const PERIODE_KESELONGAN: LaporanKasPeriode = {
  outlet: null,
  saldoAwal: { total: 0, tunai: 0, nonTunai: 0 },
  pendapatan: { total: 0, tunai: 0, nonTunai: 0 },
  penambahanKas: { total: 0, tunai: 0, nonTunai: 0 },
  penguranganKas: { total: 0, tunai: 0, nonTunai: 0 },
  saldoAkhir: { total: 0, tunai: 0, nonTunai: 0 },
};

export async function fetchLaporanKasPeriode(
  mulai: string,
  sampai: string,
): Promise<LaporanKasPeriode> {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) return PERIODE_KESELONGAN;

  const awal = startTs(mulai);
  const akhir = endTs(sampai);

  try {
    const data = await sql`
      WITH tk AS (
        SELECT waktu_transaksi, tipe_transaksi, nama_transaksi, pesanan_id,
               nilai_debet, nilai_kredit
        FROM transaksi_keuangan
        WHERE toko_id::text = ${selectedToko}
      )
      SELECT
        (SELECT nama_toko FROM toko WHERE id::text = ${selectedToko}) AS outlet,

        -- Saldo awal: seluruh transaksi sebelum periode
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz), 0) AS saldo_awal_total,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz AND t.tipe_transaksi = 'tunai'), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz AND t.tipe_transaksi = 'tunai'), 0) AS saldo_awal_tunai,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.waktu_transaksi < ${awal}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0) AS saldo_awal_non_tunai,

        -- Pendapatan: transaksi terkait pesanan dalam periode (net debet - kredit)
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz), 0) AS pendapatan_total,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'tunai'), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'tunai'), 0) AS pendapatan_tunai,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0)
          - COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.pesanan_id IS NOT NULL AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0) AS pendapatan_non_tunai,

        -- Penambahan Kas dalam periode (debet)
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.nama_transaksi = 'Penambahan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz), 0) AS penambahan_total,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.nama_transaksi = 'Penambahan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'tunai'), 0) AS penambahan_tunai,
        COALESCE(SUM(t.nilai_debet) FILTER (WHERE t.nama_transaksi = 'Penambahan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0) AS penambahan_non_tunai,

        -- Pengurangan Kas dalam periode (kredit)
        COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.nama_transaksi = 'Pengurangan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz), 0) AS pengurangan_total,
        COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.nama_transaksi = 'Pengurangan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'tunai'), 0) AS pengurangan_tunai,
        COALESCE(SUM(t.nilai_kredit) FILTER (WHERE t.nama_transaksi = 'Pengurangan Kas' AND t.waktu_transaksi >= ${awal}::timestamptz AND t.waktu_transaksi < ${akhir}::timestamptz AND t.tipe_transaksi = 'non_tunai'), 0) AS pengurangan_non_tunai
      FROM tk t
    `;

    const row = data[0];
    const saldoAwal: SaldoPerTipe = {
      total: Number(row?.saldo_awal_total ?? 0),
      tunai: Number(row?.saldo_awal_tunai ?? 0),
      nonTunai: Number(row?.saldo_awal_non_tunai ?? 0),
    };
    const pendapatan: SaldoPerTipe = {
      total: Number(row?.pendapatan_total ?? 0),
      tunai: Number(row?.pendapatan_tunai ?? 0),
      nonTunai: Number(row?.pendapatan_non_tunai ?? 0),
    };
    const penambahanKas: SaldoPerTipe = {
      total: Number(row?.penambahan_total ?? 0),
      tunai: Number(row?.penambahan_tunai ?? 0),
      nonTunai: Number(row?.penambahan_non_tunai ?? 0),
    };
    const penguranganKas: SaldoPerTipe = {
      total: Number(row?.pengurangan_total ?? 0),
      tunai: Number(row?.pengurangan_tunai ?? 0),
      nonTunai: Number(row?.pengurangan_non_tunai ?? 0),
    };
    const saldoAkhir: SaldoPerTipe = {
      total:
        saldoAwal.total +
        pendapatan.total +
        penambahanKas.total -
        penguranganKas.total,
      tunai:
        saldoAwal.tunai +
        pendapatan.tunai +
        penambahanKas.tunai -
        penguranganKas.tunai,
      nonTunai:
        saldoAwal.nonTunai +
        pendapatan.nonTunai +
        penambahanKas.nonTunai -
        penguranganKas.nonTunai,
    };

    return {
      outlet: (row?.outlet as string | null) ?? null,
      saldoAwal,
      pendapatan,
      penambahanKas,
      penguranganKas,
      saldoAkhir,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil laporan kas per periode.");
  }
}

export async function fetchFilteredTransaksiKas(
  mulai: string,
  sampai: string,
  currentPage: number,
): Promise<BarisLaporanKas[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) return [];

  try {
    const rows = await sql<BarisLaporanKas[]>`
      SELECT
        t.id,
        t.waktu_transaksi,
        t.nama_transaksi,
        t.tipe_transaksi,
        t.nilai_debet,
        t.nilai_kredit,
        t.keterangan,
        t.pesanan_id,
        p.nomor_pesanan
      FROM transaksi_keuangan AS t
      LEFT JOIN public.pesanan AS p
        ON p.id = t.pesanan_id
      WHERE t.toko_id::text = ${selectedToko}
        AND t.waktu_transaksi >= ${startTs(mulai)}::timestamptz
        AND t.waktu_transaksi < ${endTs(sampai)}::timestamptz
      ORDER BY t.waktu_transaksi DESC, t.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil daftar transaksi kas.");
  }
}

export async function fetchLaporanKasPages(
  mulai: string,
  sampai: string,
): Promise<number> {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) return 0;

  try {
    const data = await sql`
      SELECT COUNT(*) AS count
      FROM transaksi_keuangan AS t
      WHERE t.toko_id::text = ${selectedToko}
        AND t.waktu_transaksi >= ${startTs(mulai)}::timestamptz
        AND t.waktu_transaksi < ${endTs(sampai)}::timestamptz
    `;
    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman laporan kas.");
  }
}

