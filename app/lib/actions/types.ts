// Tipe state form untuk semua server action.
// Harus berada di file terpisah (non-"use server") karena file "use server"
// hanya boleh mengekspor async function.
// Dipakai via: import { State } from "@/app/lib/actions";
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
    nama?: string[];
    no_hp?: string[];
    email?: string[];
    alamat?: string[];
    nama_toko?: string[];
    telephone?: string[];
    alamat_toko?: string[];
    nama_durasi?: string[];
    lama_durasi?: string[];
    nama_diskon?: string[];
    tipe_diskon?: string[];
    nilai_diskon?: string[];
    nama_layanan?: string[];
    nama_antar_jemput?: string[];
    harga_antar_jemput?: string[];

    harga?: string[];
    tipe_id?: string[];
    durasi_id?: string[];
    toko_id?: string[];
    id?: string[];
    peran?: string[];
    name?: string[];
    password?: string[];

    pelanggan_id?: string[];
    items?: string[];
    antar_jemput_id?: string[];
    metode_pembayaran?: string[];
    jumlah_bayar?: string[];
  };
  message: string;
  conflict?: "existing_user" | "existing_user_toko";
  existingUser?: {
    id: string;
    name: string;
    email: string;
  };
  tokoName?: string;
  peran?: string;
};
