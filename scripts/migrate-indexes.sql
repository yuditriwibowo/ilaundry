-- Performance Indexes
-- Run: psql "$DATABASE_URL" -f scripts/migrate-indexes.sql

-- Pesanan indexes
CREATE INDEX IF NOT EXISTS pesanan_toko_id_idx ON pesanan (toko_id);
CREATE INDEX IF NOT EXISTS pesanan_status_pesanan_idx ON pesanan (status_pesanan);
CREATE INDEX IF NOT EXISTS pesanan_status_pembayaran_idx ON pesanan (status_pembayaran);
CREATE INDEX IF NOT EXISTS pesanan_tgl_pesanan_idx ON pesanan (tgl_pesanan);
CREATE INDEX IF NOT EXISTS pesanan_tgl_estimasi_selesai_idx ON pesanan (tgl_estimasi_selesai);
CREATE INDEX IF NOT EXISTS pesanan_pelanggan_id_idx ON pesanan (pelanggan_id);
CREATE INDEX IF NOT EXISTS pesanan_kasir_id_idx ON pesanan (kasir_id);
CREATE INDEX IF NOT EXISTS pesanan_nomor_pesanan_idx ON pesanan (nomor_pesanan);

-- Item pesanan indexes
CREATE INDEX IF NOT EXISTS item_pesanan_pesanan_id_idx ON item_pesanan (pesanan_id);
CREATE INDEX IF NOT EXISTS item_pesanan_status_item_idx ON item_pesanan (status_item);

-- Layanan indexes
CREATE INDEX IF NOT EXISTS layanan_toko_id_idx ON layanan (toko_id);
CREATE INDEX IF NOT EXISTS layanan_tipe_id_idx ON layanan (tipe_id);
CREATE INDEX IF NOT EXISTS layanan_durasi_id_idx ON layanan (durasi_id);

-- Pelanggan indexes
CREATE INDEX IF NOT EXISTS pelanggan_nama_idx ON pelanggan (nama);
CREATE INDEX IF NOT EXISTS pelanggan_no_hp_idx ON pelanggan (no_hp);

-- User toko indexes (user_id already indexed from auth migration)
CREATE INDEX IF NOT EXISTS user_toko_toko_id_idx ON user_toko (toko_id);
CREATE INDEX IF NOT EXISTS user_toko_peran_idx ON user_toko (peran);