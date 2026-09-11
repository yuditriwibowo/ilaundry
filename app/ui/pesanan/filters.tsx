"use client";

import { useRouter, useSearchParams } from "next/navigation";
import TabBar, { type Tab } from "@/app/ui/tab-bar";
import { StatusPesanan, StatusPembayaran } from "@/app/lib/definitions";

const statusPesananOptions: { value: StatusPesanan; label: string }[] = [
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "diambil", label: "Diambil" },
];

const statusPembayaranOptions: { value: StatusPembayaran; label: string }[] = [
  { value: "belum_bayar", label: "Belum Bayar" },
  { value: "DP", label: "DP" },
  { value: "lunas", label: "Lunas" },
];

export default function PesananFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";
  const bayar = searchParams.get("bayar") || "";

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

  const statusTabs: Tab[] = [
    { key: "", label: "Semua" },
    ...statusPesananOptions.map((item) => ({ key: item.value, label: item.label })),
  ];

  const bayarTabs: Tab[] = [
    { key: "", label: "Semua" },
    ...statusPembayaranOptions.map((item) => ({ key: item.value, label: item.label })),
  ];

  return (
    <div className="flex w-full flex-col gap-2 short-screen:gap-1">
      <TabBar
        label="Filter Status Pesanan"
        tabs={statusTabs}
        value={status}
        onSelect={(value) => handleFilterChange("status", value)}
      />
      <TabBar
        label="Filter Status Pembayaran"
        tabs={bayarTabs}
        value={bayar}
        onSelect={(value) => handleFilterChange("bayar", value)}
      />
    </div>
  );
}
