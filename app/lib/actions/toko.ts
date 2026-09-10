"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredToko } from "../data/toko";
import type { State } from "./types";

const TokoSchema = z.object({
  id: z.string(),
  nama_toko: z.string(),
  alamat_toko: z.string().nullable(),
  telephone: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateToko = TokoSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_toko: z.string().min(1, { message: "Nama toko wajib diisi." }),
});

const UpdateToko = TokoSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_toko: z.string().min(1, { message: "Nama toko wajib diisi." }),
});

export async function createToko(prevState: State, formData: FormData) {
  await getCurrentUser();
  const validatedFields = CreateToko.safeParse({
    nama_toko: formData.get("nama_toko"),
    alamat_toko: formData.get("alamat_toko"),
    telephone: formData.get("telephone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah toko.",
    };
  }

  const { nama_toko, alamat_toko, telephone } = validatedFields.data;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO toko (nama_toko, alamat_toko, telephone, created_at, last_update, update_by)
      VALUES (${nama_toko}, ${alamat_toko}, ${telephone}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah toko.",
    };
  }
  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
}

export async function updateToko(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const validatedFields = UpdateToko.safeParse({
    nama_toko: formData.get("nama_toko"),
    alamat_toko: formData.get("alamat_toko"),
    telephone: formData.get("telephone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui toko.",
    };
  }

  const { nama_toko, alamat_toko, telephone } = validatedFields.data;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE toko
      SET nama_toko = ${nama_toko}, alamat_toko = ${alamat_toko}, telephone = ${telephone}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui toko.",
    };
  }

  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
}

export async function deleteToko(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM toko WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Toko.");
  }
  revalidatePath("/laundry/pengaturan/toko");
}

export async function fetchMoreToko(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredToko(query, page);
}
