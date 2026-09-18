-- ============================================================
-- Migrasi otentikasi & otorisasi yLaundry
-- Standardisasi nilai kolom peran di tabel user_toko.
-- Peran baru: Administrator | Account_Owner | Manager | Pegawai
-- (peran NULL tetap diizinkan = user belum di-assign peran)
--
-- Jalankan: psql $POSTGRES_URL_NON_POOLING -f scripts/migrate-auth.sql
-- ============================================================

-- 1. Migrasi data existing: 'Kasir' -> 'Pegawai'
UPDATE user_toko SET peran = 'Pegawai' WHERE peran = 'Kasir';

-- 2. Constraint nilai peran (idempotent)
ALTER TABLE user_toko DROP CONSTRAINT IF EXISTS user_toko_peran_check;
ALTER TABLE user_toko
  ADD CONSTRAINT user_toko_peran_check
  CHECK (peran IN ('Administrator', 'Account_Owner', 'Manager', 'Pegawai') OR peran IS NULL);

-- 3. Index lookup login (daftar toko per user)
CREATE INDEX IF NOT EXISTS user_toko_user_id_idx ON user_toko (user_id);
