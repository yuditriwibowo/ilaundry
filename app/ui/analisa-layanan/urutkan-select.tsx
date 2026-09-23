"use client";

/**
 * Popup "Urutkan" Analisa Layanan.
 *
 * - Trigger bergaya select form project (border, chevron kanan) berisi label
 *   opsi urutan terpilih; daftar opsi dirender sebagai popup via portal ke
 *   document.body (pola sama dengan SelectPopup di
 *   app/ui/shared/select-popup.tsx & PilihPeriodePopup).
 * - Opsi urutan sesuai desain Analisa Layanan: Nilai/Kuantitas tertinggi &
 *   terendah, Nama Layanan A-Z, Nama Durasi A-Z.
 * - Saat opsi dipilih, navigasi (router.push) ke
 *   /laundry/analisa/layanan?mulai=..&sampai=..&urutkan=.. mempertahankan
 *   periode aktif. Sorting dihitung di server (ORDER BY query), bukan client.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/** Daftar opsi urutan (kunci = nilai `?urutkan=` di URL). */
const OPSI_URUTAN = [
  { id: "nilai-tertinggi", label: "Nilai Tertinggi" },
  { id: "nilai-terendah", label: "Nilai Terendah" },
  { id: "kuantitas-tertinggi", label: "Kuantitas Tertinggi" },
  { id: "kuantitas-terendah", label: "Kuantitas Terendah" },
  { id: "nama-layanan", label: "Nama Layanan A-Z" },
  { id: "nama-durasi", label: "Nama Durasi A-Z" },
] as const;

export default function UrutkanSelect({
  value,
  mulai,
  sampai,
}: {
  // Kunci urutan aktif (divalidasi server, selalu anggota OPSI_URUTAN).
  value: string;
  // Periode aktif yang dipertahankan saat navigasi.
  mulai: string;
  sampai: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const selected =
    OPSI_URUTAN.find((opsi) => opsi.id === value) ?? OPSI_URUTAN[0];

  // Kunci scroll body selama popup terbuka (pola sama dengan SelectPopup).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Tutup popup dengan tombol Escape.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function choose(id: string) {
    setOpen(false);
    router.push(
      `/laundry/analisa/layanan?mulai=${mulai}&sampai=${sampai}&urutkan=${id}`,
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="min-w-0 truncate text-gray-900">
          {selected.label}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Urutkan"
              className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Urutkan
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

              {/* Daftar opsi urutan */}
              <ul>
                {OPSI_URUTAN.map((opsi) => {
                  const isSelected = opsi.id === selected.id;
                  return (
                    <li key={opsi.id}>
                      <button
                        type="button"
                        onClick={() => choose(opsi.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-gray-100 font-semibold text-primary-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="min-w-0 flex-1">{opsi.label}</span>
                        {isSelected && (
                          <CheckIcon className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
