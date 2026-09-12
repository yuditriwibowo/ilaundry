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
        ${statusPembayaran ? sql`p.status_pembayaran = ${statusPembayaran}` : sql`1=1`} AND
        (p.nomor_pesanan ILIKE ${`%${query}%`} OR
         pl.nama ILIKE ${`%${query}%`} OR
         pl.no_hp ILIKE ${`%${query}%`} OR
         u.name ILIKE ${`%${query}%`})
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
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM public.pesanan AS p
      LEFT JOIN public.pelanggan AS pl
        ON pl.id = p.pelanggan_id
      LEFT JOIN public.users AS u
        ON u.id = p.kasir_id
      WHERE
        ${selectedToko ? sql`p.toko_id = ${selectedToko}` : sql`1=0`} AND
        ${statusPesanan ? sql`p.status_pesanan = ${statusPesanan}` : sql`1=1`} AND
        ${statusPembayaran ? sql`p.status_pembayaran = ${statusPembayaran}` : sql`1=1`} AND
        (p.nomor_pesanan ILIKE ${`%${query}%`} OR
         pl.nama ILIKE ${`%${query}%`} OR
         pl.no_hp ILIKE ${`%${query}%`} OR
         u.name ILIKE ${`%${query}%`})
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
