-- ============================================================
-- Migrasi MFA kode unik email (yLaundry)
-- Tabel mfa_kode: kode verifikasi 6 digit per-user (identifier email)
-- PER TUJUAN — dipakai MFA pendaftaran (tipe 'registrasi') dan siap
-- untuk change/reset password ('reset_password') serta MFA login
-- ('login') tanpa migrasi ulang.
--
-- Semantik:
-- - PRIMARY KEY (email, tipe): kode per-email per-tujuan — kode untuk
--   satu tujuan tidak bisa dipakai untuk tujuan lain.
-- - Kirim ulang = UPSERT (hanya kode TERAKHIR yang berlaku).
-- - Expired 3 menit (dicek via expired_at > now() — relatif, aman dari
--   shift timezone UTC karena write & check sama-sama pakai now() DB).
--
-- Jalankan: node --env-file=.env scripts/run-mfa.js
-- ============================================================

CREATE TABLE IF NOT EXISTS mfa_kode (
  email      TEXT NOT NULL,
  tipe       TEXT NOT NULL,
  kode       TEXT NOT NULL,
  expired_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (email, tipe)
);

-- Index pembersihan baris expired (DELETE WHERE expired_at < now())
CREATE INDEX IF NOT EXISTS mfa_kode_expired_at_idx ON mfa_kode (expired_at);