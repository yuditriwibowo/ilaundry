"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "../db";
import {
  getCurrentUser,
  getSessionContext,
  canCreateToko,
  canManageMasterData,
} from "../auth";
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
  const ctx = await getSessionContext();
  // Otorisasi: hanya Administrator & Account_Owner yang boleh membuat toko.
  if (!canCreateToko(ctx)) {
    return {
      message:
        "Anda tidak memiliki hak akses untuk membuat toko baru. Hubungi Administrator atau pemilik akun.",
    };
  }

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
  const userId = ctx.user.id;
  const now = new Date().toISOString();
  const tokoId = crypto.randomUUID();

  try {
    // Satu transaksi: toko baru + assignment user_toko (peran Account_Owner)
    // untuk user yang membuat toko tersebut.
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO toko (id, nama_toko, alamat_toko, telephone, created_at, last_update, update_by)
        VALUES (${tokoId}, ${nama_toko}, ${alamat_toko}, ${telephone}, ${now}, ${now}, ${userId})
      `;
      await tx`
        INSERT INTO user_toko (id, user_id, toko_id, peran, created_at, last_update, update_by)
        VALUES (${crypto.randomUUID()}, ${userId}, ${tokoId}, 'Account_Owner', ${now}, ${now}, ${userId})
      `;
    });
  } catch (error) {
    console.error("Database Error (createToko):", error);
    return {
      message: "Database Error: Gagal menambah toko.",
    };
  }
  revalidatePath("/laundry/pengaturan/toko");
  redirect("/laundry/pengaturan/toko");
}

export async function updateToko(id: string, prevState: State, formData: FormData) {
  const user = await getCurrentUser();
  // Otorisasi: fungsi pengaturan ditolak untuk Pegawai.
  if (!canManageMasterData(user.peran)) {
    return {
      message:
        "Anda tidak memiliki hak akses untuk mengubah data pengaturan.",
    };
  }

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
  const userId = user.id;
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
  const user = await getCurrentUser();
  // Otorisasi: fungsi pengaturan ditolak untuk Pegawai.
  if (!canManageMasterData(user.peran)) {
    throw new Error(
      "Anda tidak memiliki hak akses untuk menghapus data pengaturan.",
    );
  }
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM user_toko WHERE toko_id = ${id}`;
      await tx`DELETE FROM toko WHERE id = ${id}`;
    });
  } catch (error) {
    throw new Error("Database Error: Failed to Delete Toko.");
  }
  revalidatePath("/laundry/pengaturan/toko");
}

export async function fetchMoreToko(query: string, page: number) {
  await getCurrentUser();
  return await fetchFilteredToko(query, page);
}

