import { cookies } from "next/headers";
import { sql } from "../db";
import { Parfum } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchParfum() {
  try {
    const data = await sql<Parfum[]>`SELECT * FROM parfum ORDER BY nama_parfum ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch parfum.");
  }
}

export async function fetchFilteredParfum(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const parfum = await sql<Parfum[]>`
      SELECT
        id,
        nama_parfum,
        toko_id,
        update_by,
        last_update,
        created_at
      FROM parfum
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
        (nama_parfum ILIKE ${`%${query}%`} OR
        toko_id::text ILIKE ${`%${query}%`})
      ORDER BY nama_parfum ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return parfum;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch parfum.");
  }
}

export async function fetchParfumPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`SELECT COUNT(*)
    FROM parfum
    WHERE
      ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
      (nama_parfum ILIKE ${`%${query}%`} OR
      toko_id::text ILIKE ${`%${query}%`})
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman parfum.");
  }
}

export async function fetchParfumById(id: string) {
  try {
    const data = await sql<Parfum[]>`
      SELECT * FROM parfum
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch parfum.");
  }
}

// ==== Opsi untuk form tambah pesanan ====

export async function fetchParfumForForm() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const data = await sql<Pick<Parfum, "id" | "nama_parfum">[]>`
      SELECT id, nama_parfum
      FROM parfum
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`}
      ORDER BY nama_parfum ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data parfum.");
  }
}
