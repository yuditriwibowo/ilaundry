"use server";

// Server actions otentikasi: verifikasi kredensial login, registrasi akun
// baru (+ toko pertama), dan sign out. Pemanggilan signIn() yang sesungguhnya
// dilakukan dari client via next-auth/react (dengan tokoId terpilih), agar
// pilihan toko di form login bisa diaktifkan setelah kredensial terverifikasi.

import bcrypt from "bcrypt";
import { z } from "zod";
import { sql } from "../db";
import { signOut } from "../auth-nextauth";
import type { TokoAssignment } from "../definitions";
import type { State } from "./types";

import { createAuthTicket } from "../auth-ticket";

// ---------- Login: langkah 1 — verifikasi kredensial ----------
// Mengembalikan daftar toko (nama + peran) yang di-assign ke user dari tabel
// user_toko. Pesan gagal SELALU sama (jangan bocorkan email terdaftar).
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message?: string;
  tokos?: TokoAssignment[];
  authTicket?: string;
}> {
  if (!email || !password) {
    return { success: false, message: "Email dan password wajib diisi." };
  }

  try {
    const users = await sql<{ id: string; password: string }[]>`
      SELECT id, password
      FROM users
      WHERE email = ${email}
    `;
    const user = users[0];
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatch) {
      return { success: false, message: "email/password salah" };
    }

    const rows = await sql<
      { toko_id: string; nama_toko: string; peran: string | null }[]
    >`
      SELECT ut.toko_id, t.nama_toko, ut.peran
      FROM user_toko AS ut
      JOIN toko AS t
        ON t.id = ut.toko_id
      WHERE ut.user_id = ${user.id}
      ORDER BY t.nama_toko ASC
    `;

    return {
      success: true,
      authTicket: createAuthTicket(user.id, email),
      tokos: rows.map((row) => ({
        tokoId: row.toko_id,
        namaToko: row.nama_toko,
        peran: (row.peran as TokoAssignment["peran"]) ?? null,
      })),
    };
  } catch (error) {
    console.error("Database Error (verifyCredentials):", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// ---------- Registrasi akun baru + toko pertama ----------
const RegisterSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi." }),
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Email tidak valid." }),
  no_hp: z.string().min(1, { message: "No. HP wajib diisi." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
  passwordConfirm: z.string().min(1, { message: "Konfirmasi password wajib diisi." }),
  nama_toko: z.string().min(1, { message: "Nama toko wajib diisi." }),
  alamat_toko: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
});

export async function registerAccount(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    no_hp: formData.get("no_hp"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    nama_toko: formData.get("nama_toko"),
    alamat_toko: formData.get("alamat_toko"),
    telephone: formData.get("telephone"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as State["errors"],
      message: "Beberapa field tidak valid. Gagal membuat akun.",
    };
  }

  const data = parsed.data;
  if (data.password !== data.passwordConfirm) {
    return {
      errors: { password: ["Password dan konfirmasi password tidak sama."] },
      message: "Password dan konfirmasi password tidak sama.",
    };
  }

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const tokoId = crypto.randomUUID();
  const userTokoId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    // Satu transaksi: user + toko + user_toko (peran Account_Owner).
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO users (id, name, email, password, no_hp, tanggal_mulai, status)
        VALUES (${userId}, ${data.name}, ${data.email}, ${passwordHash}, ${data.no_hp}, ${now}, 'aktif')
      `;
      await tx`
        INSERT INTO toko (id, nama_toko, alamat_toko, telephone, created_at, last_update, update_by)
        VALUES (${tokoId}, ${data.nama_toko}, ${data.alamat_toko ?? null}, ${data.telephone ?? null}, ${now}, ${now}, ${userId})
      `;
      await tx`
        INSERT INTO user_toko (id, user_id, toko_id, peran, created_at, last_update, update_by)
        VALUES (${userTokoId}, ${userId}, ${tokoId}, 'Account_Owner', ${now}, ${now}, ${userId})
      `;
    });
  } catch (error) {
    console.error("Database Error (registerAccount):", error);
    const pgError = error as { code?: string; constraint?: string };
    if (
      pgError.code === "23505" ||
      pgError.constraint === "users_email_key"
    ) {
      return {
        errors: { email: ["Email sudah terdaftar. Gunakan email lain."] },
        message: "Email sudah terdaftar. Gunakan email lain.",
      };
    }
    return { message: "Database Error: Gagal membuat akun. Coba lagi." };
  }

  return {
    success: true,
    tokoId,
    message: "Akun berhasil dibuat. Mengalihkan ke beranda...",
  };
}

// ---------- Sign out ----------
// Tombol Sign Out di halaman Pengaturan (untuk semua peran).
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
