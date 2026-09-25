"use client";

/**
 * Kalender tanggal custom (pengganti <input type="date"> native).
 *
 * Kenapa custom: dialog date picker native di Android dirender oleh OS di
 * luar halaman web dan SELALU mengikuti tema perangkat — `color-scheme`
 * tidak berpengaruh. Kalender ini dirender React sebagai bagian halaman,
 * jadi tampilannya 100% mengikuti pengaturan Mode Display aplikasi.
 *
 * - Grid 6 baris × 7 kolom, kolom pertama Minggu, tinggi selalu stabil.
 * - Logika tanggal di app/ui/shared/kalender-utils.ts (teruji unit test):
 *   parsing ISO lokal, clamping bulan/hari, batas min/max inklusif.
 * - Aksesibilitas (pola WAI-ARIA Date Picker Dialog):
 *   - role grid/gridcell, `aria-selected`, `aria-current="date"` untuk hari ini,
 *   - roving tabindex: hanya tanggal ber-fokus yang tabIndex 0,
 *   - ←/→/↑/↓ geser 1/7 hari, PageUp/PageDown geser bulan, Home/End awal/akhir
 *     minggu — fokus selalu di-clamp ke rentang min/max,
 *   - Enter/Space memilih (native button), Escape ditangani pemanggil.
 *
 * Props function memakai akhiran "Action" sesuai konvensi Next.js.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  HARI_INDO,
  addMonths,
  clampIso,
  dayOfWeek,
  formatBulanTahun,
  getMonthCells,
  geserBulanIso,
  isIsoInRange,
  monthKeyOf,
  monthKeyOfIso,
  parseIso,
  shiftIso,
  todayIso,
  toIso,
} from "./kalender-utils";

export default function KalenderTanggal({
  value,
  minDate,
  maxDate,
  onSelectAction,
  judul = "Pilih tanggal",
}: {
  /** Tanggal terpilih saat ini (ISO "YYYY-MM-DD"). */
  value: string;
  /** Batas paling awal yang bisa dipilih (inklusif, ISO). */
  minDate: string;
  /** Batas paling akhir yang bisa dipilih (inklusif, ISO). */
  maxDate: string;
  /** Dipanggil saat user memilih tanggal yang valid. */
  onSelectAction: (iso: string) => void;
  judul?: string;
}) {
  // Bulan yang sedang ditampilkan; awalnya bulan dari tanggal terpilih.
  const [view, setView] = useState(() => {
    const parts =
      parseIso(value) ?? parseIso(clampIso(todayIso(), minDate, maxDate));
    return parts
      ? { year: parts.year, monthIndex: parts.monthIndex }
      : { year: new Date().getFullYear(), monthIndex: new Date().getMonth() };
  });
  // Tanggal ber-fokus keyboard (roving tabindex); awalnya tanggal terpilih.
  const [fokusIso, setFokusIso] = useState(() =>
    clampIso(parseIso(value) ? value : todayIso(), minDate, maxDate),
  );
  const gridRef = useRef<HTMLDivElement>(null);

  // Saat kalender dibuka (mount), fokus ke tombol tanggal ber-fokus.
  // Ref stabil, tidak ada state yang di-set di sini.
  useEffect(() => {
    gridRef.current
      ?.querySelector<HTMLButtonElement>("button[data-fokus='true']")
      ?.focus();
  }, []);

  const cells = getMonthCells(view.year, view.monthIndex);
  const viewKey = monthKeyOf(view.year, view.monthIndex);
  const minKey = monthKeyOfIso(minDate);
  const maxKey = monthKeyOfIso(maxDate);
  const today = todayIso();

  // Nav bulan via tombol tidak bisa keluar rentang min/max.
  const prevDisabled = minKey !== null && viewKey <= minKey;
  const nextDisabled = maxKey !== null && viewKey >= maxKey;

  /** Pindahkan fokus ke hari pertama bulan `year`/`monthIndex` yang valid. */
  function fokusKeBulan(year: number, monthIndex: number) {
    // Bulan view selalu tumpang-tindih rentang (tombol nav dinonaktifkan di
    // luar itu), jadi clamp tanggal-1 dijamin berada di bulan view.
    const firstIso = toIso(year, monthIndex, 1);
    setFokusIso(clampIso(firstIso, minDate, maxDate));
  }

  function navigasiBulan(delta: number) {
    const base =
      parseIso(fokusIso) ??
      parseIso(value) ?? { year: view.year, monthIndex: view.monthIndex, day: 1 };
    const next = addMonths(base.year, base.monthIndex, base.day, delta);
    setView({ year: next.year, monthIndex: next.monthIndex });
    fokusKeBulan(next.year, next.monthIndex);
  }

  function handleGridKeyDown(e: React.KeyboardEvent) {
    let next: string | null = null;
    switch (e.key) {
      case "ArrowLeft":
        next = shiftIso(fokusIso, -1);
        break;
      case "ArrowRight":
        next = shiftIso(fokusIso, 1);
        break;
      case "ArrowUp":
        next = shiftIso(fokusIso, -7);
        break;
      case "ArrowDown":
        next = shiftIso(fokusIso, 7);
        break;
      case "PageUp":
        next = geserBulanIso(fokusIso, -1);
        break;
      case "PageDown":
        next = geserBulanIso(fokusIso, 1);
        break;
      case "Home":
        next = shiftIso(fokusIso, -dayOfWeek(fokusIso));
        break;
      case "End":
        next = shiftIso(fokusIso, 6 - dayOfWeek(fokusIso));
        break;
      default:
        return; // biarkan Enter/Space ditangani tombol secara native
    }
    e.preventDefault();
    // Fokus tidak boleh keluar rentang: clamp (tombol di luar rentang disabled).
    const clamped = clampIso(next, minDate, maxDate);
    setFokusIso(clamped);
    // Jika fokus pindah bulan, ikuti tampilannya (mis. ArrowRight di akhir bulan).
    const parts = parseIso(clamped);
    if (parts && (parts.year !== view.year || parts.monthIndex !== view.monthIndex)) {
      setView({ year: parts.year, monthIndex: parts.monthIndex });
    }
  }

  return (
    <div>
      {/* Header: nav bulan */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigasiBulan(-1)}
          disabled={prevDisabled}
          aria-label="Bulan sebelumnya"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div aria-live="polite" className="text-sm font-semibold text-gray-900">
          {formatBulanTahun(view.year, view.monthIndex)}
        </div>
        <button
          type="button"
          onClick={() => navigasiBulan(1)}
          disabled={nextDisabled}
          aria-label="Bulan berikutnya"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Grid tanggal */}
      <div
        ref={gridRef}
        role="grid"
        aria-label={judul}
        onKeyDown={handleGridKeyDown}
      >
        {/* Baris nama hari */}
        <div role="row" className="grid grid-cols-7">
          {HARI_INDO.map((hari) => (
            <div
              key={hari}
              role="columnheader"
              className="py-1 text-center text-xs font-medium text-gray-500"
            >
              {hari}
            </div>
          ))}
        </div>
        {/* 6 baris minggu (sel null = kotak kosong di luar bulan) */}
        {[0, 1, 2, 3, 4, 5].map((minggu) => (
          <div key={minggu} role="row" className="grid grid-cols-7">
            {cells.slice(minggu * 7, minggu * 7 + 7).map((sel, kolom) => {
              if (!sel) {
                return (
                  <div key={`kosong-${minggu}-${kolom}`} role="gridcell" />
                );
              }
              const disabled = !isIsoInRange(sel.iso, minDate, maxDate);
              const selected = sel.iso === value;
              const fokus = sel.iso === fokusIso;
              const isToday = sel.iso === today;
              return (
                <div key={sel.iso} role="gridcell" className="p-0.5">
                  <button
                    type="button"
                    data-fokus={fokus || undefined}
                    tabIndex={fokus ? 0 : -1}
                    disabled={disabled}
                    aria-disabled={disabled}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => onSelectAction(sel.iso)}
                    className={`h-8 w-full rounded-full text-sm transition-colors ${
                      disabled
                        ? "cursor-not-allowed text-gray-300"
                        : selected
                          ? "bg-primary-600 font-semibold text-white hover:bg-primary-700"
                          : fokus
                            ? "bg-primary-50 font-medium text-primary-700"
                            : "text-gray-700 hover:bg-gray-100"
                    } ${isToday && !selected ? "ring-1 ring-inset ring-primary-300" : ""}`}
                  >
                    {sel.day}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
