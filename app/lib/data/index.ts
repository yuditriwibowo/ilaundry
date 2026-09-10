// Barrel data layer.
// Semua konsumen tetap mengimpor dari "@/app/lib/data" — path ini
// sekarang resolve ke folder ini (index.ts) setelah data.ts lama dihapus.
export * from "./constants";
export * from "./dashboard";
export * from "./template"; // TODO(step 4): hapus bersama sisa template
export * from "./pelanggan";
export * from "./toko";
export * from "./durasi";
export * from "./layanan";
export * from "./parfum";
export * from "./diskon";
export * from "./antar-jemput";
export * from "./usertoko";
export * from "./pesanan";
