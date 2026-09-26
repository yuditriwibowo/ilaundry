import { sql } from "../db";
import { InfoIklan } from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchInfoIklan() {
  try {
    const data = await sql<InfoIklan[]>`
      SELECT * FROM info_iklan
      ORDER BY start DESC NULLS LAST, created_at DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch info iklan.");
  }
}

export async function fetchFilteredInfoIklan(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Info & Iklan berlaku GLOBAL — tidak difilter per selected_toko.
    const infoIklan = await sql<InfoIklan[]>`
      SELECT
        id,
        title,
        description,
        image_src,
        link,
        start,
        "end",
        update_by,
        last_update,
        created_at
      FROM info_iklan
      WHERE
        ${query?.trim() ? sql`(title ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`})` : sql`TRUE`}
      ORDER BY start DESC NULLS LAST, created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return infoIklan;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch info iklan.");
  }
}

export async function fetchInfoIklanPages(query: string) {
  try {
    // Info & Iklan berlaku GLOBAL — tidak difilter per selected_toko.
    const data = await sql`SELECT COUNT(*)
    FROM info_iklan
    WHERE
      ${query?.trim() ? sql`(title ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`})` : sql`TRUE`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman info iklan.");
  }
}

export async function fetchInfoIklanById(id: string) {
  try {
    const data = await sql<InfoIklan[]>`
      SELECT * FROM info_iklan
      WHERE id = ${id};
    `;

    if (data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch info iklan.");
  }
}

// ==== Data carousel Informasi & Iklan (beranda) ====

/**
 * Info & Iklan yang AKTIF saat ini untuk carousel beranda:
 * - start IS NULL atau start <= now() (sudah mulai berlaku), dan
 * - end IS NULL (tanpa batas waktu) atau end >= now() (belum berakhir).
 * Berlaku GLOBAL — tidak difilter per selected_toko.
 */
export async function fetchInfoIklanForCarousel() {
  try {
    const data = await sql<
      Pick<InfoIklan, "id" | "title" | "description" | "image_src" | "link">[]
    >`
      SELECT id, title, description, image_src, link
      FROM info_iklan
      WHERE
        (start IS NULL OR start <= now())
        AND ("end" IS NULL OR "end" >= now())
      ORDER BY start DESC NULLS LAST, created_at DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data carousel info iklan.");
  }
}