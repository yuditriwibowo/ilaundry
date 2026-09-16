"use client";

// Modal Update Pembayaran Pesanan. Hanya mengubah jumlah_bayar & metode;
// status_pembayaran dan kurang_bayar dihitung ulang di server dari total_bayar
// saat ini. Dimuat via next/dynamic dari komponen tombol.

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { updatePembayaranPesanan } from "@/app/lib/actions";
import { statusPembayaranText } from "@/app/lib/pesanan-labels";
import type { MetodePembayaran, TabelPesanan } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";

export default function UpdatePembayaranModal({
  pesanan,
  show,
  onClose,
  onSuccessAction,
}: {
  pesanan: TabelPesanan;
  show: boolean;
  onClose: () => void;
  onSuccessAction?: (updated: TabelPesanan) => void;
}) {
  const router = useRouter();
  const [jumlahBayar, setJumlahBayar] = useState<string>(
    String(Number(pesanan.jumlah_bayar) || 0),
  );
  const [metode, setMetode] = useState<MetodePembayaran | "">(
    pesanan.metode_pembayaran ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalBayar = Number(pesanan.total_bayar) || 0;
  const jumlah = Number(jumlahBayar) || 0;
  const kurangBayar = Math.max(0, totalBayar - jumlah);
  const previewStatus =
    jumlah <= 0 ? "belum_bayar" : jumlah >= totalBayar ? "lunas" : "DP";

  // Reset form ke nilai terbaru setiap kali modal dibuka (pola resmi React)
  const [prevPesanan, setPrevPesanan] = useState(pesanan);
  const [prevShow, setPrevShow] = useState(show);
  if (
    (show && !prevShow) ||
    pesanan.jumlah_bayar !== prevPesanan.jumlah_bayar ||
    pesanan.metode_pembayaran !== prevPesanan.metode_pembayaran
  ) {
    setPrevShow(show);
    setPrevPesanan(pesanan);
    setJumlahBayar(String(Number(pesanan.jumlah_bayar) || 0));
    setMetode(pesanan.metode_pembayaran ?? "");
    setErrorMsg(null);
  }

  if (!show) return null;

  async function handleSave() {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const result = await updatePembayaranPesanan(pesanan.id, jumlah, metode || undefined);
      if (!result.success || !result.pesanan) {
        setErrorMsg(result.message ?? "Gagal memperbarui pembayaran.");
        return;
      }
      router.refresh();
      onSuccessAction?.(result.pesanan);
      onClose();
    } catch (error) {
      console.error("Failed to update pembayaran:", error);
      setErrorMsg("Gagal memperbarui pembayaran.");
    } finally {
      setIsSaving(false);
    }
  }

  const metodeOptions: { id: MetodePembayaran; label: string }[] = [
    { id: "tunai", label: "Tunai" },
    { id: "non_tunai", label: "Non Tunai" },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/60 dark:text-green-400">
            <BanknotesIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Update Pembayaran
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {pesanan.nomor_pesanan ?? "-"} • {pesanan.nama_pelanggan ?? "-"}
            </p>
          </div>
        </div>

        {/* Jumlah Bayar (format rupiah) */}
        <label htmlFor="update-bayar-jumlah" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          Jumlah Bayar
        </label>
        <div className="relative mb-3">
          <input
            id="update-bayar-jumlah"
            type="text"
            inputMode="numeric"
            value={jumlahBayar === "" ? "" : formatRupiah(Number(jumlahBayar))}
            onChange={(e) => setJumlahBayar(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Masukkan jumlah bayar"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
          />
          <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>

        {/* Metode Pembayaran */}
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          Metode Pembayaran
        </label>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {metodeOptions.map((option) => {
            const isSelected = metode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMetode(option.id)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-950/40 dark:text-primary-300"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {/* Ringkasan */}
        <div className="mb-4 space-y-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-sm dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-slate-400">Total Tagihan</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">
              {formatRupiah(totalBayar)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-slate-400">Kurang Bayar</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {formatRupiah(kurangBayar)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-slate-400">Status Pembayaran</span>
            <span className="font-medium text-gray-900 dark:text-slate-100">
              {statusPembayaranText[previewStatus]}
            </span>
          </div>
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
            onClick={onClose}
            className="flex-1 touch-manipulation rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSaving || (jumlah > 0 && !metode)}
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

