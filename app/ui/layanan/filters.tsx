"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LayananFilters({ 
  optionsTipe, 
  optionsDurasi 
}: { 
  optionsTipe: any[]; 
  optionsDurasi: any[]; 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tipe, setTipe] = useState(searchParams.get("tipe") || "");
  const [durasi, setDurasi] = useState(searchParams.get("durasi") || "");

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
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
        value={tipe} 
        onChange={(e) => {
          setTipe(e.target.value);
          handleFilterChange("tipe", e.target.value);
        }}
        className="block flex-1 min-w-0 w-full cursor-pointer rounded-md border border-gray-200 py-2 px-2.5 text-sm outline-none bg-white text-gray-900 truncate focus:border-blue-500"
      >
        <option value="">Semua Tipe</option>
        {optionsTipe.map((item) => (
          <option key={item.id} value={item.id}>{item.nama}</option>
        ))}
      </select>

      <select 
        value={durasi} 
        onChange={(e) => {
          setDurasi(e.target.value);
          handleFilterChange("durasi", e.target.value);
        }}
        className="block flex-1 min-w-0 w-full cursor-pointer rounded-md border border-gray-200 py-2 px-2.5 text-sm outline-none bg-white text-gray-900 truncate focus:border-blue-500"
      >
        <option value="">Semua Durasi</option>
        {optionsDurasi.map((item) => (
          <option key={item.id} value={item.nama}>{item.nama}</option>
        ))}
      </select>
    </div>
  );
}
