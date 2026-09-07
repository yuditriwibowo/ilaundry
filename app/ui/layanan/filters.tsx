"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TabBar, { type Tab } from "@/app/ui/tab-bar";

export default function LayananFilters({
  optionsTipe,
  optionsDurasi,
}: {
  optionsTipe: any[];
  optionsDurasi: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tipe = searchParams.get("tipe") || "";
  const durasi = searchParams.get("durasi") || "";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const tipeTabs: Tab[] = [
    { key: "", label: "Semua Tipe" },
    ...optionsTipe.map((item) => ({ key: String(item.id), label: item.nama })),
  ];

  const durasiTabs: Tab[] = [
    { key: "", label: "Semua Durasi" },
    ...optionsDurasi.map((item) => ({ key: item.nama, label: item.nama })),
  ];

  return (
    <div className="flex w-full flex-col gap-2 short-screen:gap-1">
      <TabBar
        label="Filter Tipe Layanan"
        tabs={tipeTabs}
        value={tipe}
        onSelect={(value) => handleFilterChange("tipe", value)}
      />
      <TabBar
        label="Filter Durasi Layanan"
        tabs={durasiTabs}
        value={durasi}
        onSelect={(value) => handleFilterChange("durasi", value)}
      />
    </div>
  );
}
