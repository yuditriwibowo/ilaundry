import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sql } from "./db";
import { authConfig } from "./auth-config";
import type { Peran, TokoAssignment } from "./definitions";

/**
 * NextAuth (Auth.js v5) — instance aplikasi.
 *
 * Provider: Credentials (email + password, hash bcrypt di tabel users).
 * Saat authorize sukses, daftar toko user (dari tabel user_toko) beserta
 * perannya disertakan ke JWT (lihat auth-config.ts) sehingga otorisasi
 * per-toko tidak butuh query DB di setiap request.
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
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
            tokoId: z.string().uuid().optional().or(z.literal("")),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          return null;
        }
        const { email, password, tokoId } = parsed.data;

        // 1. Cari user + verifikasi password (bcrypt).
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
        const passwordMatch = await bcrypt.compare(password, dbUser.password);
        if (!passwordMatch) {
          return null;
        }

        // 2. Ambil daftar toko user + peran masing-masing.
        const tokoList = (await fetchTokoList(dbUser.id)) ?? [];

        // 3. Tentukan toko terpilih: dari pilihan login, divalidasi.
        const isAdmin = tokoList.some((t) => t.peran === "Administrator");
        let selectedTokoId: string | null = null;
        if (tokoId) {
          const allowed =
            isAdmin || tokoList.some((t) => t.tokoId === tokoId);
          if (allowed) {
            selectedTokoId = tokoId;
          } else {
            // Toko yang tidak di-assign: tolak login (jangan diam-diam fallback).
            return null;
          }
        } else {
          selectedTokoId = tokoList[0]?.tokoId ?? null;
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
