import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL belum di-set. Tambahkan di file .env lalu jalankan ulang server dev.",
  );
}

// Satu-satunya koneksi database untuk seluruh aplikasi.
// Pemakaian: import { sql } from "@/app/lib/db";
export const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });
