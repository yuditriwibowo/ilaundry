"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { setSelectedTokoAction } from "@/app/lib/actions";
import SelectPopup from "@/app/ui/shared/select-popup";
import type { Toko } from "@/app/lib/definitions";

/*
  Select Toko berbasis popup dengan pencarian (pola sama dengan SelectPelanggan).
  Saat toko dipilih, cookie selected_toko di-set via server action lalu
  router.refresh() agar data halaman terkait toko ter-update.
*/
export default function SelectToko({
  stores,
  selectedToko = "",
}: {
  stores: Toko[];
  selectedToko?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Sinkronisasi defaultValue eksternal (cookie) saat server re-render
  // dengan nilai yang berubah (pola derive-state-during-render React).
  const [selected, setSelected] = useState(selectedToko);
  const [prevSelectedToko, setPrevSelectedToko] = useState(selectedToko);

  if (selectedToko !== prevSelectedToko) {
    setPrevSelectedToko(selectedToko);
    setSelected(selectedToko);
  }

  const handleChange = (newValue: string) => {
    setSelected(newValue);
    startTransition(async () => {
      await setSelectedTokoAction(newValue);
      router.refresh();
    });
  };

  return (
    <div className="w-full">
      <SelectPopup
        defaultValue={selected}
        placeholder="Pilih Toko"
        dialogTitle="Pilih Toko"
        searchPlaceholder="Cari nama toko..."
        emptyMessage="Toko tidak ditemukan"
        resultLabel="toko ditemukan"
        icon={BuildingStorefrontIcon}
        onChange={handleChange}
        options={stores.map((store) => ({
          id: String(store.id),
          label: store.nama_toko,
          description: store.alamat_toko || undefined,
        }))}
      />
    </div>
  );
}

