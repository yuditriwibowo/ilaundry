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
    <div className="flex flex-row items-center gap-3">
      <select 
        value={tipe} 
        onChange={(e) => {
          setTipe(e.target.value);
          handleFilterChange("tipe", e.target.value);
        }}
        className="block w-full min-w-[200px] cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 bg-white text-black"
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
        className="block w-full min-w-[200px] cursor-pointer rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 bg-white text-black"
      >
        <option value="">Semua Durasi</option>
        {optionsDurasi.map((item) => (
          <option key={item.id} value={item.nama}>{item.nama}</option>
        ))}
      </select>
    </div>
  );
}
