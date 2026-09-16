"use client";

// Tombol aksi per baris item pesanan (halaman detail). Modal status item
// dimuat dinamis (next/dynamic) dan hanya dirender saat tombol status diklik.

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowPathIcon,
  PencilIcon,
  PrinterIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { deleteItemPesanan } from "@/app/lib/actions";
import { printStrukItem } from "@/app/lib/struk-wa";
import type { ItemPesanan, TabelPesanan } from "@/app/lib/definitions";

const UpdateStatusItemModal = dynamic(
  () => import("./modals/update-status-item-modal"),
);

export function ItemPesananActionButtons({
  pesanan,
  item,
  onDeleteAction,
  onUpdateAction,
}: {
  pesanan: TabelPesanan;
  item: ItemPesanan;
  onDeleteAction?: (id: string) => void;
  // Dipanggil setelah update status item sukses dengan data item terbaru,
  // agar list (infinite scroll/table) bisa mengganti data barisnya di state lokal.
  onUpdateAction?: (updated: ItemPesanan) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteItemPesanan(item.id, item.pesanan_id);
      onDeleteAction?.(item.id);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* Print Struk item */}
        <button
          type="button"
          onClick={(e) => {
            // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
            e.stopPropagation();
            printStrukItem(pesanan, item);
          }}
          title="Print Struk"
          className="flex h-7 w-7 touch-manipulation items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-gray-100"
        >
          <span className="sr-only">Print Struk</span>
          <PrinterIcon className="h-3.5 w-3.5" />
        </button>
        {/* Update Status item */}
        <button
          type="button"
          onClick={(e) => {
            // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
            e.stopPropagation();
            setShowStatusModal(true);
          }}
          title="Update Status"
          className="flex h-7 w-7 touch-manipulation items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
        >
          <span className="sr-only">Update Status</span>
          <ArrowPathIcon className="h-3.5 w-3.5" />
        </button>
        <Link
          href={`/laundry/pesanan/${item.pesanan_id}/item/${item.id}/edit`}
          title="Edit Item"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-gray-100"
        >
          <span className="sr-only">Edit Item</span>
          <PencilIcon className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
            e.stopPropagation();
            setShowConfirm(true);
          }}
          title="Hapus Item"
          className="flex h-7 w-7 touch-manipulation items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        >
          <span className="sr-only">Hapus Item</span>
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
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
                Apakah Anda yakin akan menghapus item ini?
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

      {/* Modal Update Status Item Pesanan (dirender hanya saat dibuka) */}
      {showStatusModal && (
        <UpdateStatusItemModal
          item={item}
          show
          onCloseAction={() => setShowStatusModal(false)}
          onSuccessAction={(updated) => onUpdateAction?.(updated)}
        />
      )}
    </>
  );
}


