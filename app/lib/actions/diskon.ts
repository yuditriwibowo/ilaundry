"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredDiskon } from "../data/diskon";
import type { State } from "./types";

const DiskonSchema = z.object({
  id: z.string(),
  nama_diskon: z.string(),
  tipe_diskon: z.enum(["Persentase", "Nominal"]),
  nilai_diskon: z.coerce.number(),
  toko_id: z.string().nullable(),
  created_at: z.string(),
  last_update: z.string().nullable(),
  update_by: z.string().nullable(),
});

const CreateDiskon = DiskonSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_diskon: z.string().min(1, { message: "Nama diskon wajib diisi." }),
  tipe_diskon: z.enum(["Persentase", "Nominal"], {
    invalid_type_error: "Pilih tipe diskon yang valid.",
  }),
  nilai_diskon: z.coerce.number().gt(0, { message: "Nilai diskon harus lebih dari 0." }),
});

const UpdateDiskon = DiskonSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_diskon: z.string().min(1, { message: "Nama diskon wajib diisi." }),
  tipe_diskon: z.enum(["Persentase", "Nominal"], {
    invalid_type_error: "Pilih tipe diskon yang valid.",
  }),
  nilai_diskon: z.coerce.number().gt(0, { message: "Nilai diskon harus lebih dari 0." }),
});

export async function createDiskon(prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateDiskon.safeParse({
    nama_diskon: formData.get("nama_diskon"),
    tipe_diskon: formData.get("tipe_diskon"),
    nilai_diskon: formData.get("nilai_diskon"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah diskon.",
    };
  }

  const { nama_diskon, tipe_diskon, nilai_diskon, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO diskon (nama_diskon, tipe_diskon, nilai_diskon, toko_id, created_at, last_update, update_by)
      VALUES (${nama_diskon}, ${tipe_diskon}, ${nilai_diskon}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah diskon.",
    };
  }
  revalidatePath("/laundry/pengaturan/diskon");
  redirect("/laundry/pengaturan/diskon");
}

export async function updateDiskon(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateDiskon.safeParse({
    nama_diskon: formData.get("nama_diskon"),
    tipe_diskon: formData.get("tipe_diskon"),
    nilai_diskon: formData.get("nilai_diskon"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui diskon.",
    };
  }

  const { nama_diskon, tipe_diskon, nilai_diskon, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE diskon
      SET nama_diskon = ${nama_diskon}, tipe_diskon = ${tipe_diskon}, nilai_diskon = ${nilai_diskon}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui diskon.",
    };
  }

  revalidatePath("/laundry/pengaturan/diskon");
  redirect("/laundry/pengaturan/diskon");
}

export async function deleteDiskon(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM diskon WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Diskon.");
  }
  revalidatePath("/laundry/pengaturan/diskon");
}

export async function fetchMoreDiskon(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredDiskon(query, page);
}
