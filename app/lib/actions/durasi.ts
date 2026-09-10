"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredDurasi } from "../data/durasi";
import type { State } from "./types";

const DurasiSchema = z.object({
  id: z.string(),
  nama_durasi: z.string().nullable(),
  lama_durasi: z.coerce.number(),
  toko_id: z.string().nullable(),
  update_by: z.string().nullable(),
  last_update: z.string(),
});

const CreateDurasi = DurasiSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_durasi: z.string().min(1, { message: "Nama durasi wajib diisi." }),
  lama_durasi: z.coerce.number().gt(0, { message: "Lama durasi harus lebih dari 0." }),
});

const UpdateDurasi = DurasiSchema.omit({
  id: true,
  update_by: true,
  last_update: true,
}).extend({
  nama_durasi: z.string().min(1, { message: "Nama durasi wajib diisi." }),
  lama_durasi: z.coerce.number().gt(0, { message: "Lama durasi harus lebih dari 0." }),
});

export async function createDurasi(prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateDurasi.safeParse({
    nama_durasi: formData.get("nama_durasi"),
    lama_durasi: formData.get("lama_durasi"),
    toko_id: selectedToko,
  });


  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah durasi.",
    };
  }

  const { nama_durasi, lama_durasi, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO durasi (nama_durasi, lama_durasi, toko_id, created_at, last_update, update_by)
      VALUES (${nama_durasi}, ${lama_durasi}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah durasi.",
    };
  }
  revalidatePath("/laundry/pengaturan/durasi");
  redirect("/laundry/pengaturan/durasi");
}

export async function updateDurasi(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateDurasi.safeParse({
    nama_durasi: formData.get("nama_durasi"),
    lama_durasi: formData.get("lama_durasi"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui durasi.",
    };
  }

  const { nama_durasi, lama_durasi, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE durasi
      SET nama_durasi = ${nama_durasi}, lama_durasi = ${lama_durasi}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui durasi.",
    };
  }

  revalidatePath("/laundry/pengaturan/durasi");
  redirect("/laundry/pengaturan/durasi");
}

export async function deleteDurasi(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM durasi WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Durasi.");
  }
  revalidatePath("/laundry/pengaturan/durasi");
}

export async function fetchMoreDurasi(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredDurasi(query, page);
}
