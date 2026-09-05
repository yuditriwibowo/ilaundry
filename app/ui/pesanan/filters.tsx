"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { StatusPesanan, StatusPembayaran } from "@/app/lib/definitions";

const statusPesananOptions: { value: StatusPesanan; label: string }[] = [
  { value: "baru", label: "Baru" },
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

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [bayar, setBayar] = useState(searchParams.get("bayar") || "");

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

  return (
    <div className="flex w-full flex-row items-center gap-2">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          handleFilterChange("status", e.target.value);
        }}
        aria-label="Filter Status Pesanan"
        className="block flex-1 min-w-0 w-full cursor-pointer rounded-md border border-gray-200 py-2 px-2.5 text-sm outline-none bg-white text-gray-900 truncate focus:border-blue-500"
      >
        <option value="">Semua Status Pesanan</option>
        {statusPesananOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select
        value={bayar}
        onChange={(e) => {
          setBayar(e.target.value);
          handleFilterChange("bayar", e.target.value);
        }}
        aria-label="Filter Status Pembayaran"
        className="block flex-1 min-w-0 w-full cursor-pointer rounded-md border border-gray-200 py-2 px-2.5 text-sm outline-none bg-white text-gray-900 truncate focus:border-blue-500"
      >
        <option value="">Semua Status Bayar</option>
        {statusPembayaranOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
