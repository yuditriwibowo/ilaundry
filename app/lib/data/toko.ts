import { sql } from "../db";
import { Toko } from "../definitions";
import { getSessionUser } from "../auth";
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

/**
 * Daftar toko yang BOLEH dilihat user yang sedang login:
 * - Administrator: semua toko;
 * - peran lain   : hanya toko yang di-assign di tabel user_toko.
 * Dipakai untuk SelectToko di beranda & pengaturan.
 */
export async function fetchAccessibleToko(): Promise<Toko[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const isAdmin = user.tokos.some((t) => t.peran === "Administrator");
  if (isAdmin) {
    return fetchToko();
  }

  if (user.tokos.length === 0) {
    return [];
  }

  const tokoIds = user.tokos.map((t) => t.tokoId);
  try {
    const data = await sql<Toko[]>`
      SELECT * FROM toko
      WHERE id IN ${sql(tokoIds)}
      ORDER BY nama_toko ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch accessible stores.");
  }
}

export async function fetchFilteredToko(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Scope data: non-Administrator hanya melihat toko miliknya.
  const user = await getSessionUser();
  const isAdmin =
    user?.tokos.some((t) => t.peran === "Administrator") ?? false;
  const tokoIds = user?.tokos.map((t) => t.tokoId) ?? [];

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
        ${!user || isAdmin ? sql`1=1` : sql`id IN ${sql(tokoIds)}`} AND
        (nama_toko ILIKE ${`%${query}%`} OR
        alamat_toko ILIKE ${`%${query}%`} OR
        telephone ILIKE ${`%${query}%`})
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
  // Scope data: non-Administrator hanya menghitung toko miliknya.
  const user = await getSessionUser();
  const isAdmin =
    user?.tokos.some((t) => t.peran === "Administrator") ?? false;
  const tokoIds = user?.tokos.map((t) => t.tokoId) ?? [];

  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM toko
      WHERE
        ${!user || isAdmin ? sql`1=1` : sql`id IN ${sql(tokoIds)}`} AND
        (nama_toko ILIKE ${`%${query}%`} OR
        alamat_toko ILIKE ${`%${query}%`} OR
        telephone ILIKE ${`%${query}%`})
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
