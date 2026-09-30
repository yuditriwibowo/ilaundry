// Logika MFA kode unik email: generate, simpan, cek, dan cek waktu kirim
// kode verifikasi 6 digit per-user (identifier email) PER TUJUAN di
// tabel mfa_kode. Dipakai bersama oleh MFA pendaftaran (registrasi) dan
// siap untuk change/reset password (reset_password) & MFA login (login).
//
// Semantik (lihat scripts/migrate-mfa.sql):
// - Satu baris per (email, tipe): kirim ulang = UPSERT, sehingga hanya
//   kode TERAKHIR yang berlaku.
// - Kode expired 3 menit: write & cek sama-sama pakai now() database
//   (relatif — aman dari shift timezone UTC & skew jam app server).

import { randomInt } from "node:crypto";
import { sql } from "@/app/lib/db";

// Tujuan kode verifikasi yang dikenal sistem.
export type TipeKode = "registrasi" | "reset_password" | "login";

// Masa berlaku kode (menit) — requirement: expired dalam 3 menit.
const KODE_EXPIRED_MENIT = 3;

// Generate kode 6 digit random (crypto.randomInt — cryptographically
// secure, zero-padded; dari node:crypto karena berjalan di server).
export function generateKode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

// Simpan (upsert) kode untuk (email, tipe): kirim ulang menggantikan
// kode lama sehingga hanya kode terakhir yang berlaku. Sekalian
// bersihkan semua baris expired agar tabel tetap kecil.
export async function simpanKode(
  email: string,
  kode: string,
  tipe: TipeKode,
): Promise<void> {
  await sql`
    INSERT INTO mfa_kode (email, tipe, kode, expired_at, created_at)
    VALUES (${email}, ${tipe}, ${kode}, now() + ${KODE_EXPIRED_MENIT} * interval '1 minute', now())
    ON CONFLICT (email, tipe)
    DO UPDATE SET
      kode = EXCLUDED.kode,
      expired_at = now() + ${KODE_EXPIRED_MENIT} * interval '1 minute',
      created_at = now()
  `;
  await sql`DELETE FROM mfa_kode WHERE expired_at < now()`;
}

// Cek kode untuk (email, tipe): harus cocok dengan kode TERAKHIR dan
// belum melewati expired_at (3 menit).
export async function cekKode(
  email: string,
  kode: string,
  tipe: TipeKode,
): Promise<boolean> {
  const rows = await sql<{ valid: boolean }[]>`
    SELECT COUNT(*) > 0 AS valid
    FROM mfa_kode
    WHERE email = ${email}
      AND tipe = ${tipe}
      AND kode = ${kode}
      AND expired_at > now()
  `;
  return rows[0]?.valid === true;
}

// Waktu kirim (created_at) kode terakhir untuk (email, tipe) — dipakai
// untuk cooldown kirim ulang 60 detik di sisi server.
export async function waktuKirimTerakhir(
  email: string,
  tipe: TipeKode,
): Promise<Date | null> {
  const rows = await sql<{ created_at: Date }[]>`
    SELECT created_at FROM mfa_kode WHERE email = ${email} AND tipe = ${tipe}
  `;
  return rows[0]?.created_at ?? null;
}

// Hapus kode untuk (email, tipe) — dipakai setelah kode berhasil
// digunakan (mis. flow change/reset password nanti). Untuk registrasi,
// kode dihapus best-effort di registerAccount setelah akun dibuat.
export async function hapusKode(email: string, tipe: TipeKode): Promise<void> {
  await sql`DELETE FROM mfa_kode WHERE email = ${email} AND tipe = ${tipe}`;
}