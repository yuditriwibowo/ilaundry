"use client";

// Tombol update status & pembayaran pesanan (halaman detail). Modal dimuat
// dinamis (next/dynamic) dan hanya dirender saat dibuka agar chunk modal
// tidak ikut terunduh bersama halaman detail.

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowPathIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import type { TabelPesanan } from "@/app/lib/definitions";

const UpdateStatusPesananModal = dynamic(
  () => import("./modals/update-status-pesanan-modal"),
);
const UpdatePembayaranModal = dynamic(
  () => import("./modals/update-pembayaran-modal"),
);

export function UpdateStatusPesananButton({
  pesanan,
  onSuccessAction,
}: {
  pesanan: TabelPesanan;
  onSuccessAction?: (updated: TabelPesanan) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
          e.stopPropagation();
          setShowModal(true);
        }}
        title="Update Status Pesanan"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
      >
        <span className="sr-only">Update Status Pesanan</span>
        <ArrowPathIcon className="h-5 w-5" />
      </button>

      {showModal && (
        <UpdateStatusPesananModal
          pesanan={pesanan}
          show
          onClose={() => setShowModal(false)}
          onSuccessAction={onSuccessAction}
        />
      )}
    </>
  );
}

export function UpdatePembayaranPesananButton({
  pesanan,
  onSuccessAction,
}: {
  pesanan: TabelPesanan;
  onSuccessAction?: (updated: TabelPesanan) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
          e.stopPropagation();
          setShowModal(true);
        }}
        title="Update Pembayaran"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 transition-colors hover:bg-green-100 shadow-sm dark:border-green-900 dark:bg-green-950/40 dark:text-green-400"
      >
        <span className="sr-only">Update Pembayaran</span>
        <BanknotesIcon className="h-5 w-5" />
      </button>

      {showModal && (
        <UpdatePembayaranModal
          pesanan={pesanan}
          show
          onClose={() => setShowModal(false)}
          onSuccessAction={onSuccessAction}
        />
      )}
    </>
  );
}
