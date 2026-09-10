"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type OpsiPelanggan = { id: string; nama: string; no_hp: string };

/*
  Select Pelanggan berbasis popup dengan pencarian.
  - Trigger bergaya sama seperti input/select lain di form.
  - Nilai terpilih dikirim ke server action lewat hidden input `pelanggan_id`.
  - Popup dirender via portal ke document.body (pola sama dengan modal
    konfirmasi hapus di app/ui/antar-jemput/buttons.tsx).
  - Pencarian memfilter nama & no. HP (case-insensitive).
  - Dukungan keyboard: ↑/↓ memindahkan highlight, Enter memilih, Escape menutup.
*/
export default function SelectPelanggan({
  options,
  value,
  onChange,
  id,
  placeholder = "Pilih Pelanggan",
}: {
  options: OpsiPelanggan[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Highlight dikelola berdasarkan id item (bukan index) sehingga saat kata kunci
  // pencarian berubah, posisi highlight bisa dihitung ulang dari daftar hasil
  // tanpa perlu setState di dalam effect.
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.id === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (option) =>
        option.nama.toLowerCase().includes(term) ||
        (option.no_hp ?? "").toLowerCase().includes(term),
    );
  }, [options, query]);

  const highlightIndex = filtered.findIndex(
    (option) => option.id === highlightId,
  );
  // Jika item yang di-highlight tidak ada di daftar hasil (mis. setelah pencarian),
  // fallback ke item pertama.
  const effectiveHighlightIndex = highlightIndex >= 0 ? highlightIndex : 0;

  // Kunci scroll body selama popup terbuka (sinkronisasi dengan external system).
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

  // Jaga agar item yang di-highlight selalu terlihat di daftar.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[effectiveHighlightIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, effectiveHighlightIndex]);

  function openPopup() {
    // Reset pencarian & highlight saat popup dibuka (event-driven, bukan effect).
    setQuery("");
    setHighlightId(options.find((option) => option.id === value)?.id ?? null);
    setOpen(true);
  }

  function choose(option: OpsiPelanggan) {
    onChange(option.id);
    setOpen(false);
  }

  function moveHighlight(delta: number) {
    if (filtered.length === 0) return;
    const nextIndex = Math.max(
      0,
      Math.min(filtered.length - 1, effectiveHighlightIndex + delta),
    );
    setHighlightId(filtered[nextIndex]?.id ?? null);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[effectiveHighlightIndex];
      if (option) choose(option);
    }
  }

  return (
    <>
      <div className="relative">
        {/* Nilai tetap ikut ter-submit ke server action */}
        <input type="hidden" name="pelanggan_id" value={value} />

        <button
          type="button"
          id={id}
          onClick={openPopup}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="peer flex w-full items-center rounded-md border border-gray-200 py-2 pl-10 pr-3 text-left text-sm outline-2"
        >
          <span
            className={`min-w-0 flex-1 truncate ${
              selected ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {selected
              ? `${selected.nama}${selected.no_hp ? ` - ${selected.no_hp}` : ""}`
              : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
        </button>
        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Pilih Pelanggan"
              className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Pilih Pelanggan
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

              {/* Pencarian */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Cari nama / no. HP..."
                  autoFocus
                  aria-label="Cari pelanggan"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500"
                />
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>

              {/* Daftar hasil (scrollbar disembunyikan di mobile portrait) */}
              <ul
                ref={listRef}
                className="min-h-[80px] flex-1 overflow-y-auto portrait:scrollbar-hide"
              >
                {filtered.length === 0 ? (
                  <li className="py-6 text-center text-sm text-gray-500">
                    Pelanggan tidak ditemukan
                  </li>
                ) : (
                  filtered.map((option, index) => {
                    const isSelected = option.id === value;
                    const isHighlighted = index === effectiveHighlightIndex;
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlightId(option.id)}
                          onClick={() => choose(option)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            isHighlighted ? "bg-gray-100" : ""
                          } ${
                            isSelected
                              ? "font-semibold text-primary-600"
                              : "text-gray-700"
                          }`}
                        >
                          <UserCircleIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{option.nama}</span>
                            {option.no_hp && (
                              <span className="block truncate text-xs text-gray-500">
                                {option.no_hp}
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <CheckIcon className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>

              {filtered.length > 0 && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  {filtered.length} pelanggan ditemukan
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
