"use client";

/**
 * Popup "Pilih Periode" generik (dipakai menu laporan apa pun).
 *
 * - Date picker CUSTOM (app/ui/shared/kalender-tanggal.tsx), bukan
 *   <input type="date"> native: dialog native di Android dirender oleh OS
 *   dan selalu mengikuti tema perangkat — tidak bisa dipaksa mengikuti
 *   pengaturan Mode Display. Kalender custom dirender React di dalam
 *   halaman, jadi 100% mengikuti tema aplikasi di semua platform.
 * - Dua field tanggal (mulai & sampai) memakai satu kalender inline yang
 *   menarget field yang sedang aktif (diklik).
 * - Batas default: tanggal paling awal = 3 bulan yang lalu, paling akhir =
 *   hari ini (dinonaktifkan di kalender; halaman tujuan tetap memvalidasi
 *   ulang secara server-side).
 * - Tombol aksi default "Lihat Laporan" (bisa diubah via `labelTombolAksi`).
 * - Dirender via portal ke document.body (pola select-popup / modal
 *   update pembayaran). Keyboard: tanggal dinavigasi panah/PageUp/
 *   PageDown/Home/End, Escape menutup kalender lalu popup.
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

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import KalenderTanggal from "./kalender-tanggal";
import { formatTanggal, geserBulanIso, todayIso } from "./kalender-utils";

/** Periode terpilih yang dikirim ke pemanggil lewat `onSubmitAction`. */
export type PeriodeTerpilih = { mulai: string; sampai: string };

/** Tanggal 3 bulan yang lalu (YYYY-MM-DD) pada zona waktu lokal. */
function threeMonthsAgoIso(): string {
  // geserBulanIso sudah menangani clamping (mis. 31 Mei - 3 bulan = 30 Feb? tidak —
  // 31 Mei - 3 bulan = 28/29 Feb sesuai kabisat; logika clamping teruji di kalender-utils).
  return geserBulanIso(todayIso(), -3);
}

type FormState = {
  mulai: string;
  sampai: string;
  errorMsg: string | null;
};

type FieldTanggal = "mulai" | "sampai";

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
  // Prefix id (default: useId) agar id selalu unik walau popup dipakai
  // lebih dari sekali dalam satu halaman.
  idPrefix?: string;
}) {
  const autoId = useId();
  const prefix = idPrefix ?? autoId;
  const [form, setForm] = useState<FormState>(() => ({
    mulai: threeMonthsAgoIso(),
    sampai: todayIso(),
    errorMsg: null,
  }));
  // Field yang kalendernya sedang terbuka (satu kalender untuk dua field).
  const [fieldAktif, setFieldAktif] = useState<FieldTanggal | null>(null);
  const mulaiRef = useRef<HTMLButtonElement>(null);
  const sampaiRef = useRef<HTMLButtonElement>(null);

  const minDate = threeMonthsAgoIso();
  const maxDate = todayIso();

  // Reset ke default setiap kali popup dibuka kembali (nilai sesi sebelumnya
  // tidak dibawa). Precedent set-state-in-effect: app/ui/theme-provider.tsx.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({ mulai: threeMonthsAgoIso(), sampai: todayIso(), errorMsg: null });
    setFieldAktif(null);
  }, [open]);

  // Escape: tutup kalender dulu (fokus kembali ke field-nya), Escape kedua
  // menutup popup. Satu listener global agar tidak dobel dengan grid kalender.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (fieldAktif) {
        (fieldAktif === "mulai" ? mulaiRef : sampaiRef).current?.focus();
        setFieldAktif(null);
      } else {
        onCloseAction();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, fieldAktif, onCloseAction]);

  function pilihTanggal(field: FieldTanggal, iso: string) {
    setForm((f) => {
      const next: FormState = { ...f, [field]: iso, errorMsg: null };
      // Validasi urutan langsung (bukan menunggu submit) supaya kesalahan
      // terlihat saat terjadi. Pesan sama dengan validasi handleSubmit.
      if (next.mulai > next.sampai) {
        next.errorMsg =
          field === "mulai"
            ? "Tanggal mulai tidak boleh setelah tanggal sampai."
            : "Tanggal sampai tidak boleh sebelum tanggal mulai.";
      }
      return next;
    });
    // Tutup kalender dan kembalikan fokus ke tombol field terkait.
    (field === "mulai" ? mulaiRef : sampaiRef).current?.focus();
    setFieldAktif(null);
  }

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
        <button
          ref={mulaiRef}
          id={`${prefix}-mulai`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={fieldAktif === "mulai"}
          aria-controls={fieldAktif === "mulai" ? `${prefix}-kalender` : undefined}
          onClick={() =>
            setFieldAktif((f) => (f === "mulai" ? null : "mulai"))
          }
          className="flex w-full items-center justify-between rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm text-gray-900 transition-colors hover:bg-gray-50"
        >
          <span>{formatTanggal(form.mulai) || "Pilih tanggal"}</span>
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
        </button>

        {/* Tanggal sampai */}
        <label
          htmlFor={`${prefix}-sampai`}
          className="mb-2 mt-4 block text-sm font-medium text-gray-900"
        >
          Tanggal Sampai
        </label>
        <button
          ref={sampaiRef}
          id={`${prefix}-sampai`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={fieldAktif === "sampai"}
          aria-controls={fieldAktif === "sampai" ? `${prefix}-kalender` : undefined}
          onClick={() =>
            setFieldAktif((f) => (f === "sampai" ? null : "sampai"))
          }
          className="flex w-full items-center justify-between rounded-md border border-gray-200 py-2 pl-3 pr-3 text-sm text-gray-900 transition-colors hover:bg-gray-50"
        >
          <span>{formatTanggal(form.sampai) || "Pilih tanggal"}</span>
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
        </button>

        {/* Kalender inline untuk field yang sedang aktif */}
        {fieldAktif && (
          <div
            id={`${prefix}-kalender`}
            className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <KalenderTanggal
              value={fieldAktif === "mulai" ? form.mulai : form.sampai}
              minDate={minDate}
              maxDate={maxDate}
              onSelectAction={(iso) => pilihTanggal(fieldAktif, iso)}
              judul={
                fieldAktif === "mulai"
                  ? "Pilih tanggal mulai"
                  : "Pilih tanggal sampai"
              }
            />
          </div>
        )}

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
