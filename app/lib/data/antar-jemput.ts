import { cookies } from "next/headers";
import { sql } from "../db";
import { AntarJemput } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchFilteredAntarJemput(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const antarJemput = await sql<AntarJemput[]>`
      SELECT
        id,
        nama_antar_jemput,
        harga_antar_jemput,
        toko_id,
        update_by,
        last_update,
        created_at
      FROM antar_jemput
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
        nama_antar_jemput ILIKE ${`%${query}%`}
      ORDER BY harga_antar_jemput ASC, nama_antar_jemput ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return antarJemput;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch antar-jemput.");
  }
}

export async function fetchAntarJemputPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`SELECT COUNT(*)
    FROM antar_jemput
    WHERE
      ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`} AND
      nama_antar_jemput ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman antar-jemput.");
  }
}

export async function fetchAntarJemputById(id: string) {
  try {
    const data = await sql<AntarJemput[]>`
      SELECT * FROM antar_jemput
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch antar-jemput.");
  }
}

// ==== Opsi untuk form tambah pesanan ====

export async function fetchAntarJemputForForm() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const data = await sql<
      Pick<AntarJemput, "id" | "nama_antar_jemput" | "harga_antar_jemput">[]
    >`
      SELECT id, nama_antar_jemput, harga_antar_jemput
      FROM antar_jemput
      WHERE
        ${selectedToko ? sql`toko_id = ${selectedToko}` : sql`1=1`}
      ORDER BY nama_antar_jemput ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data antar-jemput.");
  }
}
