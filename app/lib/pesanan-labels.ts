// Label teks status pesanan/item/pembayaran & metode pembayaran.
// Murni data (bukan komponen React) — dipakai bersama oleh komponen tombol,
// modal, dan helper struk/WA.

import type {
  StatusPesanan,
  StatusPembayaran,
  StatusItem,
  MetodePembayaran,
} from "./definitions";

export const statusPembayaranText: Record<StatusPembayaran, string> = {
  belum_bayar: "Belum Bayar",
  DP: "DP",
  lunas: "Lunas",
};

export const statusItemText: Record<StatusItem, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

export const statusPesananText: Record<StatusPesanan, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

export const metodePembayaranText: Record<MetodePembayaran, string> = {
  tunai: "Tunai",
  non_tunai: "Non Tunai",
};
