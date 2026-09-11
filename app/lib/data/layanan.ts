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
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`} AND
        (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})
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
        ${durasiNama ? sql`d.nama_durasi = ${durasiNama}` : sql`1=1`} AND
        (l.nama_layanan ILIKE ${`%${query}%`} OR tl.nama_tipe ILIKE ${`%${query}%`})
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
