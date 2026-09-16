"use client";

// Modal Update Status Pesanan. Nilai form dikelola lokal (bukan FormData)
// karena update dilakukan lewat server action terpisah, bukan submit form
// create/update pesanan. Dimuat via next/dynamic dari komponen tombol.

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { updateStatusPesanan } from "@/app/lib/actions";
import { statusPesananText } from "@/app/lib/pesanan-labels";
import type { StatusPesanan, TabelPesanan } from "@/app/lib/definitions";

export default function UpdateStatusPesananModal({
  pesanan,
  show,
  onCloseAction,
  onSuccessAction,
}: {
  pesanan: TabelPesanan;
  show: boolean;
  // Sufiks "Action" agar lolos validasi serializable props komponen "use client".
  onCloseAction: () => void;
  onSuccessAction?: (updated: TabelPesanan) => void;
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<StatusPesanan>(
    pesanan.status_pesanan,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset pilihan ke status terbaru setiap kali modal dibuka (pola resmi React)
  const [prevPesanan, setPrevPesanan] = useState(pesanan);
  const [prevShow, setPrevShow] = useState(show);
  if ((show && !prevShow) || pesanan.status_pesanan !== prevPesanan.status_pesanan) {
    setPrevShow(show);
    setPrevPesanan(pesanan);
    setSelectedStatus(pesanan.status_pesanan);
    setErrorMsg(null);
  }

  if (!show) return null;

  async function handleSave() {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const result = await updateStatusPesanan(pesanan.id, selectedStatus);
      if (!result.success || !result.pesanan) {
        setErrorMsg(result.message ?? "Gagal memperbarui status pesanan.");
        return;
      }
      router.refresh();
      onSuccessAction?.(result.pesanan);
      onCloseAction();
    } catch (error) {
      console.error("Failed to update status pesanan:", error);
      setErrorMsg("Gagal memperbarui status pesanan.");
    } finally {
      setIsSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <ArrowPathIcon className="h-8 w-8" />
        </div>

        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
          Update Status Pesanan
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
          {pesanan.nomor_pesanan ?? "-"} • {pesanan.nama_pelanggan ?? "-"}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {(Object.keys(statusPesananText) as StatusPesanan[]).map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {statusPesananText[status]}
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCloseAction}
            className="flex-1 touch-manipulation rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSaving || selectedStatus === pesanan.status_pesanan}
            onClick={() => handleSave()}
            className="flex-1 touch-manipulation rounded-xl bg-primary-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
