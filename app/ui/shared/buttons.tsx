"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

/**
 * Tombol "Tambah <Entity>" — link ke halaman create.
 * Dipakai di header halaman list pengaturan.
 */
export function CreateButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 text-primary-600 md:border-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">{label}</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

const actionButtonClass =
  "flex h-8 w-8 touch-manipulation items-center justify-center rounded-full border p-2 transition-colors hover:bg-gray-100";

/**
 * Tombol edit (ikon pensil) — link ke halaman edit entitas.
 */
export function UpdateButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      title="Edit"
      className={`${actionButtonClass} border-gray-200 text-gray-600`}
    >
      <span className="sr-only">Edit</span>
      <PencilIcon className="h-4 w-4" />
    </Link>
  );
}

/**
 * Tombol hapus dengan modal konfirmasi via portal ke document.body.
 *
 * `action` adalah server action (mis. deleteDurasi) yang menerima id.
 * Server action dari file "use server" boleh diimpor ke client component
 * dan diekspor sebagai prop — pola standar React/Next.
 *
 * Modal dirender via portal ke document.body sehingga KELUAR dari subtree
 * kartu/baris yang bisa diklik (mis. card onClick -> router.push di
 * infinite-list/table-row). Ini mencegah:
 * 1. Tap "Ya"/"Tidak"/overlay di mobile ikut memicu navigasi kartu (modal berkedip
 *    lalu halaman pindah).
 * 2. Transform pada ancestor saat :active (mis. active:scale-[0.99] pada kartu)
 *    menjadikan kartu sebagai containing block untuk overlay position:fixed,
 *    sehingga modal termount salah posisi di mobile.
 * Catatan: showConfirm selalu false saat SSR/hydration dan hanya bisa true
 * lewat klik di client, sehingga document.body pasti sudah tersedia.
 */
export function DeleteButton({
  action,
  id,
  onDeleteAction,
  confirmMessage = "Apakah Anda yakin akan menghapus?",
}: {
  action: (id: string) => Promise<unknown>;
  id: string;
  onDeleteAction?: (id: string) => void;
  confirmMessage?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await action(id);
      if (onDeleteAction) {
        onDeleteAction(id);
      }
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
          e.stopPropagation();
          setShowConfirm(true);
        }}
        title="Hapus"
        className={`${actionButtonClass} border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-red-950/50 dark:hover:text-red-400`}
      >
        <span className="sr-only">Hapus</span>
        <TrashIcon className="h-4 w-4" />
      </button>

      {showConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <TrashIcon className="h-8 w-8" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Konfirmasi Hapus
              </h3>

              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                {confirmMessage}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                  className="flex-1 touch-manipulation rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Tidak
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm();
                  }}
                  className="flex-1 touch-manipulation rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
