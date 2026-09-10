import { cookies } from "next/headers";
import { sql } from "../db";
import { Diskon } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchFilteredDiskon(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const diskon = await sql<Diskon[]>`
      SELECT
        id,
        nama_diskon,
        tipe_diskon,
        nilai_diskon,
        toko_id,
        update_by,
        last_update,
        created_at
      FROM diskon
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
        (nama_diskon ILIKE ${`%${query}%`} OR
        tipe_diskon ILIKE ${`%${query}%`})
      ORDER BY nama_diskon ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return diskon;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch diskon.");
  }
}

export async function fetchDiskonPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`SELECT COUNT(*)
    FROM diskon
    WHERE
      ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
      (nama_diskon ILIKE ${`%${query}%`} OR
      tipe_diskon ILIKE ${`%${query}%`})
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman diskon.");
  }
}

export async function fetchDiskonById(id: string) {
  try {
    const data = await sql<Diskon[]>`
      SELECT * FROM diskon
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch diskon.");
  }
}

// ==== Opsi untuk form tambah pesanan ====

export async function fetchDiskonForForm() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const data = await sql<Pick<Diskon, "id" | "nama_diskon" | "tipe_diskon" | "nilai_diskon">[]>`
      SELECT id, nama_diskon, tipe_diskon, nilai_diskon
      FROM diskon
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`}
      ORDER BY nama_diskon ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data diskon.");
  }
}
