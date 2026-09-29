import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sql } from "./db";
import { authConfig } from "./auth-config";
import type { Peran, TokoAssignment } from "./definitions";

import { verifyLoginTicket, type LoginTicketPayload } from "./auth-ticket";

/**
 * NextAuth (Auth.js v5) — instance aplikasi.
 *
 * Provider: Credentials (email + password, hash bcrypt di tabel users).
 * Saat authorize sukses, daftar toko user (dari tabel user_toko) beserta
 * perannya disertakan ke JWT (lihat auth-config.ts) sehingga otorisasi
 * per-toko tidak butuh query DB di setiap request.
 *
 * Dua jalur di authorize():
 * 1. UTAMA — authTicket valid (dari verifyCredentials): identitas + daftar toko
 *    diambil dari payload ticket bertanda tangan → NOL query DB, NOL bcrypt.
 *    Ini inti optimisasi login (Varian A).
 * 2. FALLBACK — tanpa/invalid ticket (mis. auto sign-in setelah registrasi):
 *    verifikasi password via bcrypt + query DB seperti biasa.
 *
 * Field `tokoId` opsional = toko yang dipilih user di form login;
 * divalidasi: hanya boleh toko yang ter-assign di user_toko
 * (kecuali peran Administrator yang boleh semua toko).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tokoId: { label: "Toko" },
        authTicket: { label: "AuthTicket" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().optional(),
            authTicket: z.string().optional(),
            tokoId: z.string().uuid().optional().or(z.literal("")),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          return null;
        }
        const { email, password, authTicket, tokoId } = parsed.data;

        // 1. Jalur utama: authTicket valid → tanpa query DB (Varian A).
        const ticketPayload: LoginTicketPayload | null = authTicket
          ? verifyLoginTicket(authTicket, email)
          : null;

        if (ticketPayload) {
          const tokoList = ticketPayload.tokos;
          const selectedTokoId = pickToko(tokoList, tokoId);
          if (selectedTokoId === undefined) {
            // Toko yang tidak di-assign: tolak login (jangan diam-diam fallback).
            return null;
          }
          return {
            id: ticketPayload.userId,
            name: ticketPayload.name,
            email: ticketPayload.email,
            peran: effectivePeran(tokoList, selectedTokoId),
            tokoId: selectedTokoId,
            tokoList,
          };
        }

        // 2. Fallback: tanpa ticket → cari user + verifikasi password bcrypt.
        const users = await sql<
          { id: string; name: string; email: string; password: string }[]
        >`
          SELECT id, name, email, password
          FROM users
          WHERE email = ${email}
        `;
        const dbUser = users[0];
        if (!dbUser) {
          return null;
        }

        if (!password) {
          return null;
        }
        const passwordMatch = await bcrypt.compare(password, dbUser.password);
        if (!passwordMatch) {
          return null;
        }

        // Ambil daftar toko user + peran masing-masing.
        const tokoList = (await fetchTokoList(dbUser.id)) ?? [];
        const selectedTokoId = pickToko(tokoList, tokoId);
        if (selectedTokoId === undefined) {
          return null;
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          peran: effectivePeran(tokoList, selectedTokoId),
          tokoId: selectedTokoId,
          tokoList,
        };
      },
    }),
  ],
});

/**
 * Pilih toko terpilih dari pilihan login (divalidasi):
 * - tanpa tokoId  → toko pertama daftar assignment (null bila kosong);
 * - dengan tokoId → harus assignment user, atau user Administrator;
 * - toko di luar assignment → `undefined` = TOLAK login.
 */
function pickToko(
  tokoList: TokoAssignment[],
  tokoId: string | undefined,
): string | null | undefined {
  if (!tokoId) {
    return tokoList[0]?.tokoId ?? null;
  }
  const isAdmin = tokoList.some((t) => t.peran === "Administrator");
  const allowed = isAdmin || tokoList.some((t) => t.tokoId === tokoId);
  return allowed ? tokoId : undefined;
}

async function fetchTokoList(userId: string): Promise<TokoAssignment[]> {
  const rows = await sql<
    { toko_id: string; nama_toko: string; peran: string | null }[]
  >`
    SELECT ut.toko_id, t.nama_toko, ut.peran
    FROM user_toko AS ut
    JOIN toko AS t
      ON t.id = ut.toko_id
    WHERE ut.user_id = ${userId}
    ORDER BY t.nama_toko ASC
  `;
  return rows.map((row) => ({
    tokoId: row.toko_id,
    namaToko: row.nama_toko,
    peran: (row.peran as Peran | null) ?? null,
  }));
}

/**
 * Peran efektif user untuk toko terpilih:
 * - peran pada assignment toko tsb, atau
 * - 'Administrator' bila user punya assignment Administrator di toko lain
 *   (Administrator berlaku global untuk semua toko).
 */
function effectivePeran(
  tokoList: TokoAssignment[],
  selectedTokoId: string | null,
): Peran | null {
  if (selectedTokoId) {
    const assigned = tokoList.find((t) => t.tokoId === selectedTokoId);
    if (assigned?.peran) return assigned.peran;
  }
  if (tokoList.some((t) => t.peran === "Administrator")) {
    return "Administrator";
  }
  return null;
}
