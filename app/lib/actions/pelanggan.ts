"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "../db";
import { getCurrentUser } from "../auth";
import { fetchFilteredPelanggan } from "../data/pelanggan";
import type { State } from "./types";

const PelangganSchema = z.object({
  id: z.string(),
  nama: z.string(),
  no_hp: z.string(),
  alamat: z.string(),
  email: z.string(),
  image_url: z.string(),
  tgl_daftar: z.string(),
});

const CreatePelanggan = PelangganSchema.omit({
  id: true,
  image_url: true,
  tgl_daftar: true,
}).extend({
  nama: z.string().min(1, { message: "Nama pelanggan wajib diisi." }),
  no_hp: z.string().min(1, { message: "Nomor HP wajib diisi." }),
});

const UpdatePelanggan = PelangganSchema.omit({
  id: true,
  image_url: true,
  tgl_daftar: true,
}).extend({
  nama: z.string().min(1, { message: "Nama pelanggan wajib diisi." }),
  no_hp: z.string().min(1, { message: "Nomor HP wajib diisi." }),
});

export async function createPelanggan(prevState: State, formData: FormData) {
  await getCurrentUser();
  const validatedFields = CreatePelanggan.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal menambah pelanggan.",
    };
  }

  const { nama, no_hp, email, alamat } = validatedFields.data;
  const tgl_daftar = new Date().toISOString().split("T")[0];
  const image_url = "/pelanggan/avatar.png";

  try {
    await sql`
    INSERT INTO pelanggan (nama, no_hp, email, alamat, tgl_daftar, image_url)
    VALUES (${nama}, ${no_hp}, ${email}, ${alamat}, ${tgl_daftar}, ${image_url})
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal menambah pelanggan.",
    };
  }
  revalidatePath("/laundry/pelanggan");
  redirect("/laundry/pelanggan");
}

export async function updatePelanggan(id: string, prevState: State, formData: FormData) {
  await getCurrentUser();
  const validatedFields = UpdatePelanggan.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    alamat: formData.get("alamat"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Beberapa field tidak valid. Gagal memperbarui pelanggan.",
    };
  }

  const { nama, no_hp, email, alamat } = validatedFields.data;

  try {
    await sql`
      UPDATE pelanggan
      SET nama = ${nama}, no_hp = ${no_hp}, email = ${email}, alamat = ${alamat}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Gagal memperbarui pelanggan.",
    };
  }

  revalidatePath("/laundry/pelanggan");
  redirect("/laundry/pelanggan");
}

export async function deletePelanggan(id: string) {
  await getCurrentUser();
  try {
    await sql`DELETE FROM pelanggan WHERE id = ${id}`;
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Pelanggan.");
  }
  revalidatePath("/laundry/pelanggan");
}

export async function fetchMorePelanggan(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredPelanggan(query, page);
}
