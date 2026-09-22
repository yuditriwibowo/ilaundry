"use client";

/**
 * Item menu "Analisa Pelanggan" + popup "Pilih Periode".
 *
 * Wrapper tipis di atas komponen generik PilihPeriodePopup
 * (app/ui/shared/pilih-periode-popup.tsx), pola sama dengan
 * LaporanKasMenuLink (app/ui/kas/laporan-kas-menu-link.tsx) dan
 * LaporanPesananMenuLink (app/ui/laporan-pesanan/menu-link.tsx):
 * - Style tombol identik dengan MenuLink di app/laundry/laporan/page.tsx
 *   (ikon bg-primary-100, hover jadi bg-primary-500), tapi berupa button
 *   client component yang membuka popup pemilih periode.
 * - Saat periode disubmit, navigasi ke
 *   /laundry/analisa/pelanggan?mulai=..&sampai=..
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import PilihPeriodePopup from "@/app/ui/shared/pilih-periode-popup";

export default function AnalisaPelangganMenuLink({
  title = "Analisa Pelanggan",
  description = "Analisa data pelanggan",
}: {
  // Ikon (Users) diimpor langsung di file client ini — komponen ikon adalah
  // function dan tidak bisa dikirim sebagai prop dari Server Component ke
  // Client Component.
  title?: string;
  description?: string;
}) {
  const Icon = Users;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group flex w-full items-center gap-3 rounded-lg px-1 -mx-1 py-2.5 text-left transition-colors duration-200 hover:bg-gray-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 transition-colors duration-200 group-hover:bg-primary-500 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
            {title}
          </span>
          <span className="truncate text-xs text-gray-500 leading-tight">
            {description}
          </span>
        </div>
      </button>

      <PilihPeriodePopup
        open={open}
        onCloseAction={() => setOpen(false)}
        onSubmitAction={({ mulai, sampai }) => {
          setOpen(false);
          router.push(
            `/laundry/analisa/pelanggan?mulai=${mulai}&sampai=${sampai}`,
          );
        }}
      />
    </>
  );
}
