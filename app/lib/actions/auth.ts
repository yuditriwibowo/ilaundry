"use server";

// Server actions otentikasi: verifikasi kredensial login, registrasi akun
// baru (+ toko pertama), dan sign out.
//
// Alur login (optimisasi performa):
// - verifyCredentials: SATU query gabungan (users + user_toko + toko) + bcrypt.
//   Mengembalikan authTicket bertanda tangan yang MEMBAWA daftar toko user,
//   sehingga fase lanjutan tidak perlu query DB lagi (Varian A).
//   Jika user hanya punya 1 toko, login langsung DITUNTASKAN di action yang
//   sama (sesi NextAuth + cookie selected_toko) — satu ronde-trip selesai.
// - completeLogin: untuk user multi-toko, dipanggil setelah memilih toko.
//   Cukup memverifikasi ticket (HMAC, tanpa query DB) lalu membuat sesi.

import bcrypt from "bcrypt";
import { z } from "zod";
import { cookies } from "next/headers";
import { sql } from "../db";
import { signIn, signOut } from "../auth-nextauth";
import type { TokoAssignment } from "../definitions";
import type { State } from "./types";

import { createLoginTicket, verifyLoginTicket } from "../auth-ticket";

// Opsi cookie selected_toko — identik dengan app/lib/actions/session.ts.
const TOKO_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30, // 30 hari
};

// Baris hasil query gabungan: data user + daftar toko dalam satu round-trip.
type UserWithTokosRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  tokos: { tokoId: string; namaToko: string; peran: string | null }[] | null;
};

// ---------- Login: langkah 1 — verifikasi kredensial ----------
// Mengembalikan daftar toko (nama + peran) yang di-assign ke user dari tabel
// user_toko. Pesan gagal SELALU sama (jangan bocorkan email terdaftar).
// Untuk user dengan tepat 1 toko, sesi dibuat langsung di sini (auto-select)
// dan result.selectedTokoId diisi — klien cukup router.push("/laundry").
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message?: string;
  tokos?: TokoAssignment[];
  authTicket?: string;
  selectedTokoId?: string;
}> {
  if (!email || !password) {
    return { success: false, message: "Email dan password wajib diisi." };
  }

  try {
    // Satu query untuk SEMUA data login (dulu: 2 query terpisah) —
    // menghemat ±1 RTT database (~480 ms dari region jauh).
    const users = await sql<UserWithTokosRow[]>`
      SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'tokoId',  t.id,
                'namaToko', t.nama_toko,
                'peran',    ut.peran
              )
              ORDER BY t.nama_toko ASC
            ),
            '[]'::json
          )
          FROM user_toko AS ut
          JOIN toko AS t ON t.id = ut.toko_id
          WHERE ut.user_id = u.id
        ) AS tokos
      FROM users AS u
      WHERE u.email = ${email}
    `;
    const user = users[0];
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatch) {
      return { success: false, message: "email/password salah" };
    }

    const tokos: TokoAssignment[] = (user.tokos ?? []).map((row) => ({
      tokoId: row.tokoId,
      namaToko: row.namaToko,
      peran: (row.peran as TokoAssignment["peran"]) ?? null,
    }));
    const authTicket = createLoginTicket(
      { id: user.id, name: user.name, email: user.email },
      tokos,
    );

    // User dengan tepat 1 toko: tuntaskan login sekarang juga (auto-select),
    // tanpa ronde-trip tambahan dari klien.
    if (tokos.length === 1) {
      const done = await completeLoginInternal(authTicket, tokos[0].tokoId);
      if (!done.success) {
        return { success: false, message: done.message };
      }
      return {
        success: true,
        authTicket,
        tokos,
        selectedTokoId: tokos[0].tokoId,
      };
    }

    // 0 atau >1 toko: klien menampilkan pesan / dropdown pemilihan toko.
    return { success: true, authTicket, tokos };
  } catch (error) {
    console.error("Database Error (verifyCredentials):", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// ---------- Login: langkah 2 — tuntaskan sesi setelah toko dipilih ----------
// Untuk user multi-toko (dropdown muncul di form login). Verifikasi ticket
// (HMAC) + buat sesi NextAuth + set cookie selected_toko dalam SATU call —
// tanpa query DB, tanpa bcrypt. Bila ticket kedaluwarsa (>10 menit), klien
// diminta mengulang langkah "Masuk" (form masih terisi).
export async function completeLogin(
  authTicket: string,
  tokoId: string,
): Promise<{ success: boolean; message?: string }> {
  return completeLoginInternal(authTicket, tokoId);
}

async function completeLoginInternal(
  authTicket: string,
  tokoId: string,
): Promise<{ success: boolean; message?: string }> {
  if (!authTicket || !tokoId) {
    return { success: false, message: "Pilihan toko belum lengkap." };
  }

  const payload = verifyLoginTicket(authTicket);
  if (!payload) {
    return {
      success: false,
      message: "Sesi login kedaluwarsa. Silakan klik Masuk lagi.",
    };
  }

  const isAdmin = payload.tokos.some((t) => t.peran === "Administrator");
  const allowed = isAdmin || payload.tokos.some((t) => t.tokoId === tokoId);
  if (!allowed) {
    return { success: false, message: "Toko tidak valid." };
  }

  try {
    // authorize() di server memverifikasi ticket yang sama — tanpa query DB —
    // lalu menyalin cookie sesi ke response server action ini.
    await signIn("credentials", {
      redirect: false,
      email: payload.email,
      authTicket,
      tokoId,
    });
  } catch (error) {
    // Auth.js melempar CredentialsSignin bila authorize menolak.
    console.error("Gagal membuat sesi login:", error);
    return { success: false, message: "Gagal masuk. Coba lagi." };
  }

  const cookieStore = await cookies();
  cookieStore.set("selected_toko", tokoId, TOKO_COOKIE_OPTIONS);
  return { success: true };
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
