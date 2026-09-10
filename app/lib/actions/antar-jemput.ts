"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredAntarJemput } from "../data/antar-jemput";
import type { State } from "./types";

const AntarJemputSchema = z.object({
  id: z.string(),
  nama_antar_jemput: z.string(),
  harga_antar_jemput: z.coerce.number(),
  toko_id: z.string().nullable(),
  created_at: z.string(),
  last_update: z.string().nullable(),
  update_by: z.string().nullable(),
});

const CreateAntarJemput = AntarJemputSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_antar_jemput: z.string().min(1, { message: "Nama antar-jemput wajib diisi." }),
  harga_antar_jemput: z.coerce.number().min(0, { message: "Harga antar-jemput minimal 0." }),
});

const UpdateAntarJemput = AntarJemputSchema.omit({
  id: true,
  created_at: true,
  last_update: true,
  update_by: true,
}).extend({
  nama_antar_jemput: z.string().min(1, { message: "Nama antar-jemput wajib diisi." }),
  harga_antar_jemput: z.coerce.number().min(0, { message: "Harga antar-jemput minimal 0." }),
});

export async function createAntarJemput(prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = CreateAntarJemput.safeParse({
    nama_antar_jemput: formData.get("nama_antar_jemput"),
    harga_antar_jemput: formData.get("harga_antar_jemput"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah antar-jemput.",
    };
  }

  const { nama_antar_jemput, harga_antar_jemput, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO antar_jemput (nama_antar_jemput, harga_antar_jemput, toko_id, created_at, last_update, update_by)
      VALUES (${nama_antar_jemput}, ${harga_antar_jemput}, ${toko_id}, ${now}, ${now}, ${userId})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah antar-jemput.",
    };
  }
  revalidatePath("/laundry/pengaturan/antar-jemput");
  redirect("/laundry/pengaturan/antar-jemput");
}

export async function updateAntarJemput(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || null;

  const validatedFields = UpdateAntarJemput.safeParse({
    nama_antar_jemput: formData.get("nama_antar_jemput"),
    harga_antar_jemput: formData.get("harga_antar_jemput"),
    toko_id: selectedToko,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui antar-jemput.",
    };
  }

  const { nama_antar_jemput, harga_antar_jemput, toko_id } = validatedFields.data;
  const userId = cookieStore.get("user_id")?.value || null;
  const now = new Date().toISOString();

  try {
    await sql`
      UPDATE antar_jemput
      SET nama_antar_jemput = ${nama_antar_jemput}, harga_antar_jemput = ${harga_antar_jemput}, toko_id = ${toko_id}, last_update = ${now}, update_by = ${userId}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui antar-jemput.",
    };
  }

  revalidatePath("/laundry/pengaturan/antar-jemput");
  redirect("/laundry/pengaturan/antar-jemput");
}

export async function deleteAntarJemput(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM antar_jemput WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Antar-Jemput.");
  }
  revalidatePath("/laundry/pengaturan/antar-jemput");
}

export async function fetchMoreAntarJemput(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredAntarJemput(query, page);
}
