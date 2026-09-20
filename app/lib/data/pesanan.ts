import { cookies } from "next/headers";
import { sql } from "../db";
import {
  TabelPesanan,
  ItemPesanan,
} from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchFilteredPesanan(
  query: string,
  currentPage: number,
  statusPesanan?: string,
  statusPembayaran?: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const pesanan = await sql<TabelPesanan[]>`
      SELECT
        p.id,
        p.toko_id,
        p.pelanggan_id,
        p.kasir_id,
        p.nomor_pesanan,
        p.status_pesanan,
        p.tgl_pesanan,
        p.tgl_estimasi_selesai,
        p.tgl_selesai,
        p.tgl_diambil,
        p.nama_antar_jemput_snapshot,
        p.total_layanan,
        p.biaya_antar_jemput,
        p.nilai_diskon,
        p.total_bayar,
        p.status_pembayaran,
        p.metode_pembayaran,
        p.jumlah_bayar,
        p.kurang_bayar,
        p.catatan,
        p.created_at,
        p.last_update,
        p.update_by,
        p.antar_jemput_yt,
        t.nama_toko,
        t.alamat_toko,
        t.telephone AS telephone_toko,
        pl.nama AS nama_pelanggan,
        pl.no_hp,
        u.name AS nama_user
      FROM public.pesanan AS p
      LEFT JOIN public.toko AS t
        ON t.id = p.toko_id
      LEFT JOIN public.pelanggan AS pl
        ON pl.id = p.pelanggan_id
      LEFT JOIN public.users AS u
        ON u.id = p.kasir_id
      WHERE
        ${selectedToko ? sql`p.toko_id = ${selectedToko}` : sql`1=0`} AND
        ${statusPesanan ? sql`p.status_pesanan = ${statusPesanan}` : sql`1=1`} AND
        ${statusPembayaran ? sql`p.status_pembayaran = ${statusPembayaran}` : sql`1=1`}
        ${query?.trim() ? sql`AND (p.nomor_pesanan ILIKE ${`%${query}%`} OR
         pl.nama ILIKE ${`%${query}%`} OR
         pl.no_hp ILIKE ${`%${query}%`} OR
         u.name ILIKE ${`%${query}%`})` : sql``}
      ORDER BY
        p.tgl_estimasi_selesai ASC NULLS LAST,
        p.tgl_pesanan ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return pesanan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pesanan.");
  }
}

export async function fetchPesananPages(
  query: string,
  statusPesanan?: string,
  statusPembayaran?: string,
) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  const hasQuery = Boolean(query?.trim());
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM public.pesanan AS p
      ${hasQuery ? sql`
      LEFT JOIN public.pelanggan AS pl
        ON pl.id = p.pelanggan_id
      LEFT JOIN public.users AS u
        ON u.id = p.kasir_id
      ` : sql``}
      WHERE
        ${selectedToko ? sql`p.toko_id = ${selectedToko}` : sql`1=0`} AND
        ${statusPesanan ? sql`p.status_pesanan = ${statusPesanan}` : sql`1=1`} AND
        ${statusPembayaran ? sql`p.status_pembayaran = ${statusPembayaran}` : sql`1=1`}
        ${hasQuery ? sql`AND (p.nomor_pesanan ILIKE ${`%${query}%`} OR
         pl.nama ILIKE ${`%${query}%`} OR
         pl.no_hp ILIKE ${`%${query}%`} OR
         u.name ILIKE ${`%${query}%`})` : sql``}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman pesanan.");
  }
}

export async function fetchPesananById(id: string) {
  try {
    const pesanan = await sql<TabelPesanan[]>`
      SELECT
        p.id,
        p.toko_id,
        p.pelanggan_id,
        p.kasir_id,
        p.nomor_pesanan,
        p.status_pesanan,
        p.tgl_pesanan,
        p.tgl_estimasi_selesai,
        p.tgl_selesai,
        p.tgl_diambil,
        p.nama_antar_jemput_snapshot,
        p.total_layanan,
        p.biaya_antar_jemput,
        p.nilai_diskon,
        p.total_bayar,
        p.status_pembayaran,
        p.metode_pembayaran,
        p.jumlah_bayar,
        p.kurang_bayar,
        p.catatan,
        p.created_at,
        p.last_update,
        p.update_by,
        p.antar_jemput_yt,
        t.nama_toko,
        t.alamat_toko,
        t.telephone AS telephone_toko,
        pl.nama AS nama_pelanggan,
        pl.no_hp,
        u.name AS nama_user
      FROM public.pesanan AS p
      LEFT JOIN public.toko AS t
        ON t.id = p.toko_id
      LEFT JOIN public.pelanggan AS pl
        ON pl.id = p.pelanggan_id
      LEFT JOIN public.users AS u
        ON u.id = p.kasir_id
      WHERE p.id = ${id}
    `;

    return pesanan[0] || null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pesanan by id.");
  }
}

// Satu item pesanan berdasarkan id (dipakai halaman edit item).
export async function fetchItemPesananById(itemId: string) {
  try {
    const items = await sql<ItemPesanan[]>`
      SELECT
        id,
        pesanan_id,
        nama_parfum_snapshot,
        nomor_item_pesanan,
        nama_layanan_snapshot,
        tipe_layanan_snapshot,
        durasi_snapshot,
        harga_satuan,
        jumlah,
        satuan,
        subtotal,
        catatan_item,
        status_item,
        created_at,
        last_update,
        update_by,
        diskon_id,
        nilai_diskon,
        tgl_item_pesanan,
        nilai_durasi,
        tgl_estimasi_selesai,
        tgl_selesai,
        subtotal_final
      FROM public.item_pesanan
      WHERE id = ${itemId}
    `;

    return items[0] || null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch item pesanan by id.");
  }
}

export async function fetchItemPesananByPesananId(
  pesananId: string,
  page: number = 1,
) {
  const ITEMS_PER_PAGE_ITEM = 10;
  const offset = (page - 1) * ITEMS_PER_PAGE_ITEM;
  try {
    const items = await sql<ItemPesanan[]>`
      SELECT
        id,
        pesanan_id,
        nama_parfum_snapshot,
        nomor_item_pesanan,
        nama_layanan_snapshot,
        tipe_layanan_snapshot,
        durasi_snapshot,
        harga_satuan,
        jumlah,
        satuan,
        subtotal,
        catatan_item,
        status_item,
        created_at,
        last_update,
        update_by,
        diskon_id,
        nilai_diskon,
        tgl_item_pesanan,
        nilai_durasi,
        tgl_estimasi_selesai,
        tgl_selesai,
        subtotal_final
      FROM public.item_pesanan
      WHERE pesanan_id = ${pesananId}
      ORDER BY nomor_item_pesanan ASC, created_at ASC
      LIMIT ${ITEMS_PER_PAGE_ITEM} OFFSET ${offset}
    `;

    return items;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch item pesanan.");
  }
}

export async function fetchItemPesananPages(pesananId: string) {
  const ITEMS_PER_PAGE_ITEM = 10;
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM public.item_pesanan
      WHERE pesanan_id = ${pesananId}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE_ITEM);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman item pesanan.");
  }
}

// Ringkasan pesanan hari ini untuk kartu overview (LaundryCard).
// - totalRp & totalPesanan: agregasi dari tabel pesanan
// - kiloanKg, satuanPcs, meteranM: agregasi jumlah item dari tabel item_pesanan
// Hanya pesanan yang dibuat hari ini menurut WIB (tgl_pesanan), status 'batal'
// diabaikan, dan difilter sesuai toko yang dipilih (cookie selected_toko).
// Pembanding tanggal eksplisit pakai AT TIME ZONE 'Asia/Jakarta' — jangan
// pakai CURRENT_DATE / ::date polos karena timezone session DB bisa berbeda
// (default Supabase = UTC, membuat "hari ini" bergeser 7 jam).
export type RingkasanHariIni = {
  totalRp: number;
  totalPesanan: number;
  kiloanKg: number;
  satuanPcs: number;
  meteranM: number;
};

export async function fetchRingkasanHariIni(): Promise<RingkasanHariIni> {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  // Belum ada toko yang dipilih — tampilkan nol (pola sama dengan query lain: 1=0).
  if (!selectedToko) {
    return {
      totalRp: 0,
      totalPesanan: 0,
      kiloanKg: 0,
      satuanPcs: 0,
      meteranM: 0,
    };
  }

  try {
    const [pesananAgg, itemAgg] = await Promise.all([
      sql`
        SELECT
          COUNT(*) AS total_pesanan,
          COALESCE(SUM(p.total_bayar), 0) AS total_rp
        FROM public.pesanan AS p
        WHERE
          p.toko_id = ${selectedToko} AND
          p.status_pesanan <> 'batal' AND
          p.tgl_pesanan >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta') AND
          p.tgl_pesanan < (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') + interval '1 day') AT TIME ZONE 'Asia/Jakarta'
      `,
      sql`
        SELECT
          COALESCE(SUM(ip.jumlah) FILTER (WHERE ip.satuan = 'kg'), 0) AS kiloan_kg,
          COALESCE(SUM(ip.jumlah) FILTER (WHERE ip.satuan = 'pcs'), 0) AS satuan_pcs,
          COALESCE(SUM(ip.jumlah) FILTER (WHERE ip.satuan = 'm'), 0) AS meteran_m
        FROM public.item_pesanan AS ip
        JOIN public.pesanan AS p
          ON p.id = ip.pesanan_id
        WHERE
          p.toko_id = ${selectedToko} AND
          p.status_pesanan <> 'batal' AND
          ip.status_item <> 'batal' AND
          p.tgl_pesanan >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta') AND
          p.tgl_pesanan < (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') + interval '1 day') AT TIME ZONE 'Asia/Jakarta'
      `,
    ]);

    // COUNT/SUM pada postgres dikembalikan sebagai string — konversi ke number.
    return {
      totalRp: Number(pesananAgg[0]?.total_rp ?? 0),
      totalPesanan: Number(pesananAgg[0]?.total_pesanan ?? 0),
      kiloanKg: Number(itemAgg[0]?.kiloan_kg ?? 0),
      satuanPcs: Number(itemAgg[0]?.satuan_pcs ?? 0),
      meteranM: Number(itemAgg[0]?.meteran_m ?? 0),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil ringkasan pesanan hari ini.");
  }
}

// Mengambil seluruh item pesanan tanpa pagination.
// Dipakai untuk mengisi (prefill) form edit pesanan.
export async function fetchAllItemPesananByPesananId(pesananId: string) {
  try {
    const items = await sql<ItemPesanan[]>`
      SELECT
        id,
        pesanan_id,
        nama_parfum_snapshot,
        nomor_item_pesanan,
        nama_layanan_snapshot,
        tipe_layanan_snapshot,
        durasi_snapshot,
        harga_satuan,
        jumlah,
        satuan,
        subtotal,
        catatan_item,
        status_item,
        created_at,
        last_update,
        update_by,
        diskon_id,
        nilai_diskon,
        tgl_item_pesanan,
        nilai_durasi,
        tgl_estimasi_selesai,
        tgl_selesai,
        subtotal_final
      FROM public.item_pesanan
      WHERE pesanan_id = ${pesananId}
      ORDER BY nomor_item_pesanan ASC, created_at ASC
    `;

    return items;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all item pesanan.");
  }
}

export async function fetchLaporanPesananHariIni() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) {
    return {
      nilaiPesanan: 0,
      jumlahPesanan: 0,
      pesananBatal: 0,
      totalBelumBayar: 0,
    };
  }

  try {
    const data = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE p.status_pesanan <> 'batal') AS jumlah_pesanan,
        COALESCE(SUM(p.total_bayar) FILTER (WHERE p.status_pesanan <> 'batal'), 0) AS nilai_pesanan,
        COUNT(*) FILTER (WHERE p.status_pesanan = 'batal') AS pesanan_batal,
        COALESCE(SUM(p.kurang_bayar) FILTER (WHERE p.status_pesanan <> 'batal'), 0) AS total_belum_bayar
      FROM public.pesanan AS p
      WHERE p.toko_id = ${selectedToko}
        AND p.tgl_pesanan >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta')
        AND p.tgl_pesanan < (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') + interval '1 day') AT TIME ZONE 'Asia/Jakarta'
    `;

    return {
      jumlahPesanan: Number(data[0]?.jumlah_pesanan ?? 0),
      nilaiPesanan: Number(data[0]?.nilai_pesanan ?? 0),
      pesananBatal: Number(data[0]?.pesanan_batal ?? 0),
      totalBelumBayar: Number(data[0]?.total_belum_bayar ?? 0),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil laporan pesanan hari ini.");
  }
}

export async function fetchLaporanKasHariIni() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) {
    return {
      tunai: 0,
      nonTunai: 0,
    };
  }

  try {
    const data = await sql`
      SELECT 
        COALESCE(SUM(nilai_debet) FILTER (WHERE tipe_transaksi = 'tunai'), 0) - 
        COALESCE(SUM(nilai_kredit) FILTER (WHERE tipe_transaksi = 'tunai'), 0) AS tunai,
        COALESCE(SUM(nilai_debet) FILTER (WHERE tipe_transaksi = 'non_tunai'), 0) - 
        COALESCE(SUM(nilai_kredit) FILTER (WHERE tipe_transaksi = 'non_tunai'), 0) AS nonTunai
      FROM transaksi_keuangan
      WHERE toko_id::text = ${selectedToko}
    `;
    console.log("fetchLaporanKasHariIni data:", data, "selectedToko:", selectedToko);

    return {
      tunai: Number(data[0]?.tunai ?? 0),
      nonTunai: Number(data[0]?.nontunai ?? data[0]?.nonTunai ?? 0),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil laporan kas hari ini.");
  }
}

