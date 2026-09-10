import { sql } from "../db";
import { Toko } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchToko() {
  try {
    const data = await sql<Toko[]>`SELECT * FROM toko ORDER BY nama_toko ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch stores.");
  }
}

export async function fetchFilteredToko(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const toko = await sql<Toko[]>`
      SELECT
        id,
        nama_toko,
        alamat_toko,
        telephone,
        update_by,
        last_update
      FROM toko
      WHERE
        nama_toko ILIKE ${`%${query}%`} OR
        alamat_toko ILIKE ${`%${query}%`} OR
        telephone ILIKE ${`%${query}%`}
      ORDER BY nama_toko ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return toko;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch toko.");
  }
}

export async function fetchTokoPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM toko
    WHERE
      nama_toko ILIKE ${`%${query}%`} OR
      alamat_toko ILIKE ${`%${query}%`} OR
      telephone ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman toko.");
  }
}

export async function fetchTokoById(id: string) {
  try {
    const data = await sql<Toko[]>`
      SELECT * FROM toko
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch toko.");
  }
}
