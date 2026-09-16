"use client";

// Tombol hapus pesanan + modal konfirmasi (portal inline).

import { useState } from "react";
import { createPortal } from "react-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deletePesanan } from "@/app/lib/actions";
import { actionButtonClass } from "./shared";

export function DeletePesanan({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      const result = await deletePesanan(id);
      if (!result.success) {
        setErrorMsg(result.message ?? "Gagal menghapus pesanan.");
        return;
      }
      if (onDeleteAction) {
        onDeleteAction(id);
      }
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete pesanan:", error);
      setErrorMsg("Gagal menghapus pesanan.");
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
          setErrorMsg(null);
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
                Apakah Anda yakin akan menghapus pesanan ini?
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
