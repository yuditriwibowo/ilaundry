"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredParfum } from "../data/parfum";
import type { State } from "./types";

const ParfumSchema = z.object({
  id: z.string(),
  nama_parfum: z.string(),
  toko_id: z.string(),
  created_at: z.string(),
  last_update: z.string().nullable(),
  update_by: z.string().nullable(),
});

const CreateParfum = ParfumSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_parfum: z.string().min(1, { message: "Nama parfum wajib diisi." }),
  toko_id: z.string().min(1, { message: "Pilih toko terlebih dahulu." }),
});

const UpdateParfum = ParfumSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_parfum: z.string().min(1, { message: "Nama parfum wajib diisi." }),
  toko_id: z.string().min(1, { message: "Pilih toko terlebih dahulu." }),
});

export async function createParfum(prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateParfum.safeParse({
    nama_parfum: formData.get("nama_parfum"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah parfum.",
    };
  }

  const { nama_parfum, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO parfum (nama_parfum, toko_id, created_at, last_update, update_by)
      VALUES (${nama_parfum}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah parfum.",
    };
  }
  revalidatePath("/laundry/pengaturan/parfum");
  redirect("/laundry/pengaturan/parfum");
}

export async function updateParfum(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateParfum.safeParse({
    nama_parfum: formData.get("nama_parfum"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui parfum.",
    };
  }

  const { nama_parfum, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE parfum
      SET nama_parfum = ${nama_parfum}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui parfum.",
    };
  }

  revalidatePath("/laundry/pengaturan/parfum");
  redirect("/laundry/pengaturan/parfum");
}

export async function deleteParfum(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM parfum WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Parfum.");
  }
  revalidatePath("/laundry/pengaturan/parfum");
}

export async function fetchMoreParfum(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredParfum(query, page);
}
