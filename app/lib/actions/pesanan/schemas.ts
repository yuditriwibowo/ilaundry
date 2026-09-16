// Skema validasi (Zod) dan tipe hasil yang dipakai bersama oleh modul-modul
// action pesanan (crud, status, items). File ini TIDAK memakai "use server"
// karena aturan Next.js hanya mengizinkan export async function pada file
// "use server", sedangkan skema Zod adalah nilai non-async.

import { z } from "zod";
import type { TabelPesanan, ItemPesanan } from "../../definitions";

export const PesananItemSchema = z.object({
  layanan_id: z.string().min(1, { message: "Layanan wajib dipilih." }),
  jumlah: z.coerce.number().gt(0, { message: "Jumlah harus lebih dari 0." }),
  satuan: z.enum(["kg", "pcs", "m"], { message: "Satuan wajib dipilih." }),
  parfum_id: z.string().optional(),
  diskon_id: z.string().optional(),
});

// Schema dipakai bersama oleh createPesanan & updatePesanan
// (payload form keduanya identik).
export const PesananForm = z
  .object({
    pelanggan_id: z.string().min(1, { message: "Pelanggan wajib dipilih." }),
    antar_jemput_yt: z.enum(["ya", "tidak"], {
      message: "Antar jemput wajib dipilih.",
    }),
    antar_jemput_id: z.string().optional(),
    metode_pembayaran: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["tunai", "non_tunai"]).optional(),
    ),
    jumlah_bayar: z.coerce
      .number()
      .min(0, { message: "Jumlah bayar tidak boleh negatif." }),
    catatan: z.string().optional(),
    items: z
      .array(PesananItemSchema)
      .min(1, { message: "Minimal harus ada 1 item layanan." }),
  })
  .superRefine((data, ctx) => {
    if (data.antar_jemput_yt === "ya" && !data.antar_jemput_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["antar_jemput_id"],
        message: "Layanan antar-jemput wajib dipilih.",
      });
    }
    // Jika jumlah bayar diisi (> 0), metode pembayaran wajib dipilih
    if (data.jumlah_bayar > 0 && !data.metode_pembayaran) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["metode_pembayaran"],
        message:
          "Metode pembayaran wajib dipilih karena jumlah bayar sudah diisi.",
      });
    }
  });

export const StatusPesananSchema = z.enum([
  "diproses",
  "selesai",
  "diambil",
  "batal",
]);

export const MetodePembayaranSchema = z.enum(["tunai", "non_tunai"]);

export const ItemPesananFormSchema = z.object({
  layanan_id: z.string().min(1, { message: "Layanan wajib dipilih." }),
  jumlah: z.coerce.number().gt(0, { message: "Jumlah harus lebih dari 0." }),
  satuan: z.enum(["kg", "pcs", "m"], { message: "Satuan wajib dipilih." }),
  parfum_id: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  diskon_id: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  catatan_item: z.string().optional(),
});

// Hasil delete pesanan. Alasan penolakan dikembalikan sebagai pesan
// (bukan throw) agar UI bisa menampilkannya apa adanya tanpa error 500.
export type DeletePesananResult = {
  success: boolean;
  message?: string;
};

// Hasil update status/pembayaran pesanan. Pola sama dengan deletePesanan:
// penolakan dikembalikan sebagai message (bukan throw) agar UI bisa
// menampilkannya apa adanya di modal tanpa error 500 di production.
export type UpdatePesananResult = {
  success: boolean;
  message?: string;
  // Baris pesanan terbaru setelah update, untuk refresh data di klien.
  pesanan?: TabelPesanan;
};

// Hasil update status item pesanan.
export type UpdateItemStatusResult = {
  success: boolean;
  message?: string;
  // Item pesanan terbaru setelah update, untuk refresh data di klien.
  item?: ItemPesanan;
};
