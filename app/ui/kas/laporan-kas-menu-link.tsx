"use client";

/**
 * Item menu "Laporan Kas" + popup "Pilih Periode".
 *
 * Style tombol identik dengan MenuLink di app/laundry/laporan/page.tsx
 * (ikon bg-primary-100, hover jadi bg-primary-500), tapi berupa button
 * client component yang membuka popup pemilih periode.
 *
 * Popup berisi:
 * - Tanggal mulai & tanggal sampai (input date native, bergaya input form
 *   project — project tidak memakai library date picker).
 * - Batas: tanggal paling awal yang bisa dipilih = 3 bulan yang lalu
 *   (keterangan "Maks 3 bulan yang lalu."), paling akhir = hari ini.
 * - Tombol Simpan -> navigasi ke /laundry/laporan/kas?mulai=..&sampai=..
 *
 * Popup dirender via portal ke document.body (pola select-popup / modal
 * update pembayaran).
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CircleDollarSign } from "lucide-react";

/** Tanggal hari ini (YYYY-MM-DD) pada zona waktu lokal. */
function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Tanggal 3 bulan yang lalu (YYYY-MM-DD) pada zona waktu lokal. */
function threeMonthsAgoIso(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function LaporanKasMenuLink({
  title = "Laporan Kas",
  description = "Laporan mutasi kas",
}: {
  // Ikon (CircleDollarSign) diimpor langsung di file client ini — komponen
  // ikon adalah function dan tidak bisa dikirim sebagai prop dari Server
  // Component ke Client Component.
  title?: string;
  description?: string;
}) {
  const Icon = CircleDollarSign;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mulai, setMulai] = useState(threeMonthsAgoIso);
  const [sampai, setSampai] = useState(todayIso);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const minDate = threeMonthsAgoIso();
  const maxDate = todayIso();

  function handleSave() {
    if (!mulai || !sampai) {
      setErrorMsg("Tanggal mulai dan tanggal sampai wajib diisi.");
      return;
    }
    if (mulai > sampai) {
      setErrorMsg("Tanggal mulai tidak boleh setelah tanggal sampai.");
      return;
    }
    setOpen(false);
    router.push(`/laundry/laporan/kas?mulai=${mulai}&sampai=${sampai}`);
  }

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

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Pilih Periode"
              className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Pilih Periode
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Tanggal mulai */}
              <label
                htmlFor="periode-mulai"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Tanggal Mulai
              </label>
              <input
                id="periode-mulai"
                type="date"
                value={mulai}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  setMulai(e.target.value);
                  setErrorMsg(null);
                }}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm outline-2 placeholder:text-gray-500"
              />

              {/* Tanggal sampai */}
              <label
                htmlFor="periode-sampai"
                className="mb-2 mt-4 block text-sm font-medium text-gray-900"
              >
                Tanggal Sampai
              </label>
              <input
                id="periode-sampai"
                type="date"
                value={sampai}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  setSampai(e.target.value);
                  setErrorMsg(null);
                }}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm outline-2 placeholder:text-gray-500"
              />

              {/* Keterangan batas tanggal */}
              <p className="mt-3 text-xs text-gray-500">
                Maks 3 bulan yang lalu.
              </p>

              {errorMsg && (
                <p className="mt-2 text-sm text-red-500">{errorMsg}</p>
              )}

              {/* Footer aksi */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
