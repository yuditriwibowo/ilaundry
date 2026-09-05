"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { setSelectedTokoAction } from "@/app/lib/actions";

export default function SelectToko({
  stores,
  selectedToko = "",
}: {
  stores: any[];
  selectedToko?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(selectedToko);
  const [prevSelectedToko, setPrevSelectedToko] = useState(selectedToko);
  const [, startTransition] = useTransition();

  if (selectedToko !== prevSelectedToko) {
    setPrevSelectedToko(selectedToko);
    setSelected(selectedToko);
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelected(newValue);
    startTransition(async () => {
      await setSelectedTokoAction(newValue);
      router.refresh();
    });
  };

  return (
    <div className="relative w-full">
      <select
        value={selected}
        onChange={handleChange}
        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 bg-white text-gray-900"
      >
        <option value="">Pilih Toko</option>
        {stores.map((store) => (
          <option key={store.id} value={String(store.id)}>
            {store.nama_toko}
          </option>
        ))}
      </select>
      <BuildingStorefrontIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
    </div>
  );
}

