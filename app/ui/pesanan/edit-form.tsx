"use client";

// Form "Ubah Pesanan". Semua logika form ada di pesanan-form.tsx (bersama
// dengan mode create) — file ini hanya membungkusnya dengan mode "edit" agar
// import di app/laundry/pesanan/[id]/edit/page.tsx tetap sama.

import PesananForm from "./pesanan-form";
import type { ItemPesanan, TabelPesanan } from "@/app/lib/definitions";
import type {
  OpsiAntarJemput,
  OpsiDiskon,
  OpsiLayanan,
  OpsiParfum,
} from "./pesanan-form-shared";
import type { OpsiPelanggan } from "./select-pelanggan";

export default function EditForm({
  pesanan,
  initialItems,
  optionsPelanggan,
  optionsLayanan,
  optionsParfum,
  optionsDiskon,
  optionsAntarJemput,
}: {
  pesanan: TabelPesanan;
  initialItems: ItemPesanan[];
  optionsPelanggan: OpsiPelanggan[];
  optionsLayanan: OpsiLayanan[];
  optionsParfum: OpsiParfum[];
  optionsDiskon: OpsiDiskon[];
  optionsAntarJemput: OpsiAntarJemput[];
}) {
  return (
    <PesananForm
      mode="edit"
      pesanan={pesanan}
      initialItems={initialItems}
      optionsPelanggan={optionsPelanggan}
      optionsLayanan={optionsLayanan}
      optionsParfum={optionsParfum}
      optionsDiskon={optionsDiskon}
      optionsAntarJemput={optionsAntarJemput}
    />
  );
}
