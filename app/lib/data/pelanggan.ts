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
