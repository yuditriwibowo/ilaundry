"use client";

// Menu aksi per baris pesanan (list). Modal status & pembayaran dimuat
// dinamis (next/dynamic) dan hanya dirender saat menu item diklik agar
// chunk modal tidak ikut terunduh bersama halaman list.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowPathIcon,
  BanknotesIcon,
  Bars3Icon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { MessageCircleIcon } from "lucide-react";
import { deletePesanan } from "@/app/lib/actions";
import { kirimWa, printStruk } from "@/app/lib/struk-wa";
import type { TabelPesanan } from "@/app/lib/definitions";
import { actionButtonClass } from "./shared";

const UpdateStatusPesananModal = dynamic(
  () => import("./modals/update-status-pesanan-modal"),
);
const UpdatePembayaranModal = dynamic(
  () => import("./modals/update-pembayaran-modal"),
);

export function PesananActionMenu({
  pesanan,
  onDeleteAction,
  onUpdateAction,
}: {
  pesanan: TabelPesanan;
  onDeleteAction?: (id: string) => void;
  // Dipanggil setelah update status/pembayaran sukses dengan baris terbaru,
  // agar list (infinite scroll) bisa mengganti data barisnya di state lokal.
  onUpdateAction?: (updated: TabelPesanan) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPembayaranModal, setShowPembayaranModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const result = await deletePesanan(pesanan.id);
      if (!result.success) {
        setErrorMsg(result.message ?? "Gagal menghapus pesanan.");
        return;
      }
      onDeleteAction?.(pesanan.id);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete pesanan:", error);
      setErrorMsg("Gagal menghapus pesanan.");
    } finally {
      setIsDeleting(false);
    }
  }

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800 text-left";

  return (
    <>
      <div ref={menuRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          title="Menu Aksi"
          aria-haspopup="menu"
          aria-expanded={open}
          className={`${actionButtonClass} border-gray-200 text-gray-600 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800`}
        >
          <span className="sr-only">Menu Aksi</span>
          <Bars3Icon className="h-4 w-4" />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <Link
              href={`/laundry/pesanan/${pesanan.id}/detail`}
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <EyeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Lihat Detail
            </Link>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                kirimWa(pesanan);
              }}
            >
              <MessageCircleIcon className="h-4 w-4 text-green-600" />
              Kirim WA
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                printStruk(pesanan);
              }}
            >
              <PrinterIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Print
            </button>
            <Link
              href={`/laundry/pesanan/${pesanan.id}/edit`}
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <PencilIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              Edit
            </Link>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                setShowStatusModal(true);
              }}
            >
              <ArrowPathIcon className="h-4 w-4 text-blue-500" />
              Update Status
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                setShowPembayaranModal(true);
              }}
            >
              <BanknotesIcon className="h-4 w-4 text-green-600" />
              Update Pembayaran
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-slate-800" />
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:text-red-400`}
              onClick={(e) => {
                // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
                e.stopPropagation();
                setOpen(false);
                setErrorMsg(null);
                setShowConfirm(true);
              }}
            >
              <TrashIcon className="h-4 w-4" />
              Hapus
            </button>
          </div>
        ) : null}
      </div>

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
                Apakah Anda yakin akan menghapus pesanan {pesanan.nomor_pesanan ?? "ini"}?
              </p>

              {errorMsg && (
                <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">
                  {errorMsg}
                </p>
              )}

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
                    handleConfirmDelete();
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

      {/* Modal Update Status Pesanan (dirender hanya saat dibuka) */}
      {showStatusModal && (
        <UpdateStatusPesananModal
          pesanan={pesanan}
          show
          onCloseAction={() => setShowStatusModal(false)}
          onSuccessAction={(updated) => onUpdateAction?.(updated)}
        />
      )}

      {/* Modal Update Pembayaran (dirender hanya saat dibuka) */}
      {showPembayaranModal && (
        <UpdatePembayaranModal
          pesanan={pesanan}
          show
          onCloseAction={() => setShowPembayaranModal(false)}
          onSuccessAction={(updated) => onUpdateAction?.(updated)}
        />
      )}
    </>
  );
}


