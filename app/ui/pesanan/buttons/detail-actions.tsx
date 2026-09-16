"use client";

// Tombol aksi di header halaman detail pesanan. Modal status & pembayaran
// sudah dimuat dinamis oleh status-buttons.tsx.

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircleIcon } from "lucide-react";
import {
  PencilIcon,
  PrinterIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { deletePesanan } from "@/app/lib/actions";
import { kirimWa, printStruk } from "@/app/lib/struk-wa";
import type { TabelPesanan } from "@/app/lib/definitions";
import { UpdateStatusPesananButton, UpdatePembayaranPesananButton } from "./status-buttons";

export function PesananDetailActionButtons({
  pesanan,
  onDeleteSuccessAction,
}: {
  pesanan: TabelPesanan;
  onDeleteSuccessAction?: () => void;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const result = await deletePesanan(pesanan.id);
      if (!result.success) {
        setErrorMsg(result.message ?? "Gagal menghapus pesanan.");
        return;
      }
      if (onDeleteSuccessAction) {
        onDeleteSuccessAction();
      } else {
        router.push("/laundry/pesanan");
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
      <div className="flex items-center gap-3">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={() =>
            kirimWa({
              noHp: pesanan.no_hp,
              nama: pesanan.nama_pelanggan,
              nomorPesanan: pesanan.nomor_pesanan,
              totalBayar: pesanan.total_bayar,
              statusPesanan: pesanan.status_pesanan,
              statusPembayaran: pesanan.status_pembayaran,
            })
          }
          title="Kirim WhatsApp"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400 shadow-sm"
        >
          <span className="sr-only">Kirim WhatsApp</span>
          <MessageCircleIcon className="h-5 w-5" />
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={() => printStruk(pesanan)}
          title="Print Struk"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm"
        >
          <span className="sr-only">Print</span>
          <PrinterIcon className="h-5 w-5" />
        </button>

        {/* Edit */}
        <Link
          href={`/laundry/pesanan/${pesanan.id}/edit`}
          title="Edit Pesanan"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm"
        >
          <span className="sr-only">Edit</span>
          <PencilIcon className="h-5 w-5" />
        </Link>

        {/* Update Status Pesanan */}
        <UpdateStatusPesananButton pesanan={pesanan} />

        {/* Update Pembayaran */}
        <UpdatePembayaranPesananButton pesanan={pesanan} />

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
            e.stopPropagation();
            setErrorMsg(null);
            setShowConfirm(true);
          }}
          title="Hapus Pesanan"
          className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 shadow-sm"
        >
          <span className="sr-only">Hapus</span>
          <TrashIcon className="h-5 w-5" />
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
    </>
  );
}


