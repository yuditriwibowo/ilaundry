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
// CATATAN TIMEZONE: session DB default-nya UTC (Supabase). JANGAN andalkan
// CURRENT_DATE / cast ::date polos untuk logika "hari ini" — hasilnya
// mengikuti UTC sehingga bergeser 7 jam (jam 00:00–07:00 WIB masih dihitung
// kemarin). Gunakan eksplisit: (kolom AT TIME ZONE 'Asia/Jakarta')::date
// dan (now() AT TIME ZONE 'Asia/Jakarta')::date. Lihat fetchRingkasanHariIni.
// Opsi koneksi "timezone" tidak dipakai karena postgres.js tidak meneruskannya
// sebagai startup parameter dan PgBouncer bisa mengabaikannya.
export const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
  prepare: false,
});
