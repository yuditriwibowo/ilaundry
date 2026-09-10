import { cookies } from "next/headers";
import { sql } from "../db";
import { Durasi } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchDurasi() {
  try {
    const data = await sql<Durasi[]>`SELECT * FROM durasi ORDER BY nama_durasi ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}

export async function fetchFilteredDurasi(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const durasi = await sql<Durasi[]>`
      SELECT
        id,
        nama_durasi,
        lama_durasi,
        toko_id,
        update_by,
        last_update
      FROM durasi
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
        (nama_durasi ILIKE ${`%${query}%`} OR
        toko_id::text ILIKE ${`%${query}%`})
      ORDER BY nama_durasi ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return durasi;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}


export async function fetchDurasiPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`SELECT COUNT(*)
    FROM durasi
    WHERE
      ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
      (nama_durasi ILIKE ${`%${query}%`} OR
      toko_id::text ILIKE ${`%${query}%`})
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman durasi.");
  }
}

export async function fetchDurasiById(id: string) {
  try {
    const data = await sql<Durasi[]>`
      SELECT * FROM durasi
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi.");
  }
}

export async function fetchDurasiForFilter() {
  try {
    const data = await sql`SELECT id, nama_durasi as nama, lama_durasi FROM durasi ORDER BY nama_durasi ASC`;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch durasi for filter.");
  }
}
