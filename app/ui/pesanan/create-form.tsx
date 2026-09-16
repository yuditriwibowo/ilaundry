"use client";

// Form "Tambah Pesanan". Semua logika form ada di pesanan-form.tsx (bersama
// dengan mode edit) — file ini hanya membungkusnya dengan mode "create" agar
// import di app/laundry/pesanan/create/page.tsx tetap sama.

import PesananForm from "./pesanan-form";
import type {
  OpsiAntarJemput,
  OpsiDiskon,
  OpsiLayanan,
  OpsiParfum,
} from "./pesanan-form-shared";
import type { OpsiPelanggan } from "./select-pelanggan";

export default function Form({
  optionsPelanggan,
  optionsLayanan,
  optionsParfum,
  optionsDiskon,
  optionsAntarJemput,
}: {
  optionsPelanggan: OpsiPelanggan[];
  optionsLayanan: OpsiLayanan[];
  optionsParfum: OpsiParfum[];
  optionsDiskon: OpsiDiskon[];
  optionsAntarJemput: OpsiAntarJemput[];
}) {
  return (
    <PesananForm
      mode="create"
      optionsPelanggan={optionsPelanggan}
      optionsLayanan={optionsLayanan}
      optionsParfum={optionsParfum}
      optionsDiskon={optionsDiskon}
      optionsAntarJemput={optionsAntarJemput}
    />
  );
}
