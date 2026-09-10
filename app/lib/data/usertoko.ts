import { cookies } from "next/headers";
import { sql } from "../db";
import {
  TabelUserToko,
  UserTokoDetail,
} from "../definitions";
import { ITEMS_PER_PAGE } from "./constants";

export async function fetchFilteredUserToko(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  try {
    const userToko = await sql<TabelUserToko[]>`
      SELECT
        ut.id,
        u.name,
        t.nama_toko,
        ut.peran
      FROM public.user_toko AS ut
      JOIN public.users AS u
        ON u.id = ut.user_id
      JOIN public.toko AS t
        ON t.id = ut.toko_id
      WHERE
        ${selectedToko ? sql`ut.toko_id = ${selectedToko}` : sql`1=1`} AND
        ut.peran IS NOT NULL AND
        (u.name ILIKE ${`%${query}%`} OR
         t.nama_toko ILIKE ${`%${query}%`} OR
         ut.peran ILIKE ${`%${query}%`})
      ORDER BY u.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return userToko;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user toko.");
  }
}

export async function fetchUserTokoPages(query: string) {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM public.user_toko AS ut
      JOIN public.users AS u
        ON u.id = ut.user_id
      JOIN public.toko AS t
        ON t.id = ut.toko_id
      WHERE
        ${selectedToko ? sql`ut.toko_id = ${selectedToko}` : sql`1=1`} AND
        ut.peran IS NOT NULL AND
        (u.name ILIKE ${`%${query}%`} OR
         t.nama_toko ILIKE ${`%${query}%`} OR
         ut.peran ILIKE ${`%${query}%`})
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil total halaman user toko.");
  }
}

export async function fetchUnassignedUserToko() {
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value;

  if (!selectedToko) {
    return [];
  }

  try {
    const data = await sql<UserTokoDetail[]>`
      SELECT
        ut.id,
        ut.user_id,
        ut.toko_id,
        ut.peran,
        u.name,
        u.email
      FROM public.user_toko AS ut
      JOIN public.users AS u
        ON u.id = ut.user_id
      WHERE
        ${selectedToko ? sql`ut.toko_id = ${selectedToko}` : sql`1=1`}
        AND ut.peran IS NULL
      ORDER BY u.name ASC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch unassigned user toko.");
  }
}

export async function fetchUserTokoById(id: string) {
  try {
    const data = await sql<UserTokoDetail[]>`
      SELECT
        ut.id,
        ut.user_id,
        ut.toko_id,
        ut.peran,
        u.name,
        u.email,
        t.nama_toko,
        ut.created_at,
        ut.last_update
      FROM public.user_toko AS ut
      JOIN public.users AS u
        ON u.id = ut.user_id
      LEFT JOIN public.toko AS t
        ON t.id = ut.toko_id
      WHERE ut.id = ${id};
    `;
    if (data.length === 0) {
      return null;
    }
    return data[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user toko.");
  }
}
