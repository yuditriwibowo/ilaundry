import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL belum di-set. Tambahkan di file .env lalu jalankan ulang server dev.",
  );
}

// Satu-satunya koneksi database untuk seluruh aplikasi.
// Pemakaian: import { sql } from "@/app/lib/db";
// prepare: false wajib karena POSTGRES_URL melewati PgBouncer mode transaksi
// (Supabase pooler port 6543) — named prepared statements tidak reliable
// di sana dan memicu error "prepared statement ... does not exist" (26000).
export const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
  prepare: false,
});
