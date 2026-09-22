"use client";

/**
 * Popup "Pilih Periode" generik (dipakai menu laporan apa pun).
 *
 * - Dua input date native (tanggal mulai & tanggal sampai) bergaya input form
 *   project — project tidak memakai library date picker.
 * - Batas default: tanggal paling awal = 3 bulan yang lalu, paling akhir =
 *   hari ini (atribut min/max; halaman tujuan tetap memvalidasi ulang
 *   secara server-side).
 * - Tombol aksi default "Lihat Laporan" (bisa diubah via `labelTombolAksi`).
 * - Mode tampilan mengikuti pengaturan Mode Display di Pengaturan (terang /
 *   gelap / sesuai system): `color-scheme` di-set eksplisit pada tiap input
 *   date dari `resolvedTheme` (useTheme) agar native date picker ikut tema
 *   aplikasi, bukan hanya tema system/browser.
 * - Dirender via portal ke document.body (pola select-popup / modal
 *   update pembayaran).
 *
 * Pemakaian (state `open` dikelola pemanggil, mis. menu link laporan):
 *   <PilihPeriodePopup
 *     open={open}
 *     onCloseAction={() => setOpen(false)}
 *     onSubmitAction={({ mulai, sampai }) => {
 *       setOpen(false);
 *       router.push(`/laundry/laporan/xxx?mulai=${mulai}&sampai=${sampai}`);
 *     }}
 *   />
 */

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/app/ui/theme-provider";

/** Periode terpilih yang dikirim ke pemanggil lewat `onSubmitAction`. */
export type PeriodeTerpilih = { mulai: string; sampai: string };

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

type FormState = {
  mulai: string;
  sampai: string;
  errorMsg: string | null;
};

export default function PilihPeriodePopup({
  open,
  onCloseAction,
  onSubmitAction,
  judul = "Pilih Periode",
  labelTombolAksi = "Lihat Laporan",
  keteranganBatas = "Maks 3 bulan yang lalu.",
  idPrefix,
}: {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction: (periode: PeriodeTerpilih) => void;
  judul?: string;
  labelTombolAksi?: string;
  keteranganBatas?: string;
  // Prefix id input date (default: useId) agar id selalu unik walau popup
  // dipakai lebih dari sekali dalam satu halaman.
  idPrefix?: string;
}) {
  const autoId = useId();
  const prefix = idPrefix ?? autoId;
  // Tema aktual sesuai Pengaturan (light | dark | system yang sudah resolved).
  const { resolvedTheme } = useTheme();
  const [form, setForm] = useState<FormState>(() => ({
    mulai: threeMonthsAgoIso(),
    sampai: todayIso(),
    errorMsg: null,
  }));

  const minDate = threeMonthsAgoIso();
  const maxDate = todayIso();

  // Reset ke default setiap kali popup dibuka kembali (nilai sesi sebelumnya
  // tidak dibawa). Precedent set-state-in-effect: app/ui/theme-provider.tsx.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({ mulai: threeMonthsAgoIso(), sampai: todayIso(), errorMsg: null });
  }, [open]);

  function handleSubmit() {
    if (!form.mulai || !form.sampai) {
      setForm((f) => ({
        ...f,
        errorMsg: "Tanggal mulai dan tanggal sampai wajib diisi.",
      }));
      return;
    }
    if (form.mulai > form.sampai) {
      setForm((f) => ({
        ...f,
        errorMsg: "Tanggal mulai tidak boleh setelah tanggal sampai.",
      }));
      return;
    }
    onSubmitAction({ mulai: form.mulai, sampai: form.sampai });
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCloseAction}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{judul}</h3>
          <button
            type="button"
            onClick={onCloseAction}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tanggal mulai */}
        <label
          htmlFor={`${prefix}-mulai`}
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Tanggal Mulai
        </label>
        <input
          id={`${prefix}-mulai`}
          type="date"
          value={form.mulai}
          min={minDate}
          max={maxDate}
          // colorScheme eksplisit: native date picker mengikuti pengaturan
          // Mode Display (bukan hanya bawaan system/browser).
          style={{ colorScheme: resolvedTheme }}
          onChange={(e) =>
            setForm((f) => ({ ...f, mulai: e.target.value, errorMsg: null }))
          }
          className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm outline-2 placeholder:text-gray-500"
        />

        {/* Tanggal sampai */}
        <label
          htmlFor={`${prefix}-sampai`}
          className="mb-2 mt-4 block text-sm font-medium text-gray-900"
        >
          Tanggal Sampai
        </label>
        <input
          id={`${prefix}-sampai`}
          type="date"
          value={form.sampai}
          min={minDate}
          max={maxDate}
          style={{ colorScheme: resolvedTheme }}
          onChange={(e) =>
            setForm((f) => ({ ...f, sampai: e.target.value, errorMsg: null }))
          }
          className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm outline-2 placeholder:text-gray-500"
        />

        {/* Keterangan batas tanggal */}
        <p className="mt-3 text-xs text-gray-500">{keteranganBatas}</p>

        {form.errorMsg && (
          <p className="mt-2 text-sm text-red-500">{form.errorMsg}</p>
        )}

        {/* Footer aksi */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCloseAction}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {labelTombolAksi}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

