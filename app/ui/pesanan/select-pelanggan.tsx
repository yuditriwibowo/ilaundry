"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import SelectPopup from "@/app/ui/shared/select-popup";

export type OpsiPelanggan = { id: string; nama: string; no_hp: string };

/*
  Select Pelanggan berbasis popup dengan pencarian.
  Implementasi generik ada di app/ui/shared/select-popup.tsx; komponen ini
  hanya wrapper tipis yang memetakan OpsiPelanggan -> OpsiSelect dan
  mengisi teks default khusus pelanggan.
  - Nilai terpilih dikirim ke server action lewat hidden input `pelanggan_id`.
  - Pencarian memfilter nama & no. HP (case-insensitive).
  - Dukungan keyboard: ↑/↓ memindahkan highlight, Enter memilih, Escape menutup.
*/
export default function SelectPelanggan({
  options,
  name = "pelanggan_id",
  defaultValue = "",
  id,
  placeholder = "Pilih Pelanggan",
}: {
  options: OpsiPelanggan[];
  name?: string;
  defaultValue?: string;
  id?: string;
  placeholder?: string;
}) {
  return (
    <SelectPopup
      id={id}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      dialogTitle="Pilih Pelanggan"
      searchPlaceholder="Cari nama / no. HP..."
      emptyMessage="Pelanggan tidak ditemukan"
      resultLabel="pelanggan ditemukan"
      icon={UserCircleIcon}
      options={options.map((option) => ({
        id: option.id,
        label: option.nama,
        description: option.no_hp || undefined,
      }))}
    />
  );
}
