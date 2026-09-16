"use client";

// Tombol aksi kirim WhatsApp & print struk pesanan.

import { MessageCircleIcon } from "lucide-react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { kirimWa, printStruk } from "@/app/lib/struk-wa";
import type { StatusPesanan, StatusPembayaran, TabelPesanan } from "@/app/lib/definitions";
import { actionButtonClass } from "./shared";

export function KirimWaPesanan({
  noHp,
  nama,
  nomorPesanan,
  totalBayar,
  statusPesanan,
  statusPembayaran,
}: {
  noHp: string | null;
  nama: string | null;
  nomorPesanan: string | null;
  totalBayar: number;
  statusPesanan: StatusPesanan;
  statusPembayaran: StatusPembayaran;
}) {
  function handleClick() {
    kirimWa({ noHp, nama, nomorPesanan, totalBayar, statusPesanan, statusPembayaran });
  }

  return (
    <button
      onClick={handleClick}
      title="Kirim WA"
      className={`${actionButtonClass} border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400`}
    >
      <span className="sr-only">Kirim WA</span>
      <MessageCircleIcon className="h-4 w-4" />
    </button>
  );
}

export function PrintPesanan({ pesanan }: { pesanan: TabelPesanan }) {
  function handleClick() {
    printStruk(pesanan);
  }

  return (
    <button
      onClick={handleClick}
      title="Print"
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
    >
      <span className="sr-only">Print</span>
      <PrinterIcon className="h-4 w-4" />
    </button>
  );
}
