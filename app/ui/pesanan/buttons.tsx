"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PrinterIcon,
  PlusIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePesanan, deleteItemPesanan } from "@/app/lib/actions";
import { TabelPesanan, StatusPesanan, StatusPembayaran } from "@/app/lib/definitions";
import { formatDateTimeToLocal, formatRupiah } from "@/app/lib/utils";

const actionButtonClass =
  "flex h-8 w-8 touch-manipulation items-center justify-center rounded-full border p-2 transition-colors hover:bg-gray-100";

export function CreatePesanan() {
  return (
    <Link
      href="/laundry/pesanan/create"
      className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 text-primary-600 md:border-primary-600 md:bg-primary-600 md:text-white px-4 text-sm font-medium transition-colors hover:bg-primary-50 md:hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <span className="hidden md:block">Tambah Pesanan</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

const statusPembayaranText: Record<StatusPembayaran, string> = {
  belum_bayar: "Belum Bayar",
  DP: "DP",
  lunas: "Lunas",
};

const statusPesananText: Record<StatusPesanan, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
};

function normalizePhoneNumber(noHp: string) {
  const digits = noHp.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return `62${digits}`;
}

export function ViewPesananDetail({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${id}/detail`}
      title="Lihat Detail"
      className={`${actionButtonClass} border-gray-200 text-gray-600`}
    >
      <span className="sr-only">Lihat Detail</span>
      <EyeIcon className="h-4 w-4" />
    </Link>
  );
}

export function UpdatePesanan({ id }: { id: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${id}/edit`}
      title="Edit"
      className={`${actionButtonClass} border-gray-200 text-gray-600`}
    >
      <span className="sr-only">Edit</span>
      <PencilIcon className="h-4 w-4" />
    </Link>
  );
}

export function DeletePesanan({
  id,
  onDeleteAction,
}: {
  id: string;
  onDeleteAction?: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await deletePesanan(id);
      if (onDeleteAction) {
        onDeleteAction(id);
      }
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete pesanan:", error);
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
                Apakah Anda yakin akan menghapus pesanan ini?
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

export function KirimWaPesanan({
  noHp,
  nama,
  nomorPesanan,
  totalBayar,
  statusPesanan,
  statusPembayaran,
}: {
  noHp: string | null;
  nama: string | null;
  nomorPesanan: string | null;
  totalBayar: number;
  statusPesanan: StatusPesanan;
  statusPembayaran: StatusPembayaran;
}) {
  function handleClick() {
    kirimWa({ noHp, nama, nomorPesanan, totalBayar, statusPesanan, statusPembayaran });
  }

  return (
    <button
      onClick={handleClick}
      title="Kirim WA"
      className={`${actionButtonClass} border-green-200 bg-green-50 text-green-600 hover:bg-green-100`}
    >
      <span className="sr-only">Kirim WA</span>
      <MessageCircleIcon className="h-4 w-4" />
    </button>
  );
}

export function PrintPesanan({ pesanan }: { pesanan: TabelPesanan }) {
  function handleClick() {
    printStruk(pesanan);
  }

  return (
    <button
      onClick={handleClick}
      title="Print"
      className={`${actionButtonClass} border-gray-200 text-gray-600`}
    >
      <span className="sr-only">Print</span>
      <PrinterIcon className="h-4 w-4" />
    </button>
  );
}

export function kirimWa({
  noHp,
  nama,
  nomorPesanan,
  totalBayar,
  statusPesanan,
  statusPembayaran,
}: {
  noHp: string | null;
  nama: string | null;
  nomorPesanan: string | null;
  totalBayar: number;
  statusPesanan: StatusPesanan;
  statusPembayaran: StatusPembayaran;
}) {
  if (!noHp) {
    alert("Nomor HP pelanggan tidak tersedia.");
    return;
  }
  const message = [
    `Halo ${nama ?? "Kak"},`,
    "",
    `Pesanan ${nomorPesanan ?? "-"} dengan status *${statusPesananText[statusPesanan]}* dan pembayaran *${statusPembayaranText[statusPembayaran]}*.`,
    `Total bayar: ${formatRupiah(totalBayar)}.`,
    "",
    "Terima kasih telah mempercayakan cucian Anda kepada kami.",
  ].join("\n");
  const url = `https://wa.me/${normalizePhoneNumber(noHp)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function printStruk(pesanan: TabelPesanan) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;

  const rows: [string, string][] = [
    ["No. Pesanan", pesanan.nomor_pesanan ?? "-"],
    ["Tanggal", formatDateTimeToLocal(pesanan.tgl_pesanan)],
    ["Pelanggan", pesanan.nama_pelanggan ?? "-"],
    ["No. HP", pesanan.no_hp ?? "-"],
    ["Kasir", pesanan.nama_user ?? "-"],
    ["Status Pesanan", statusPesananText[pesanan.status_pesanan]],
    ["Status Bayar", statusPembayaranText[pesanan.status_pembayaran]],
    ["Metode Bayar", pesanan.metode_pembayaran ?? "-"],
  ];

  win.document.write(`
    <html>
      <head>
        <title>${pesanan.nomor_pesanan ?? "Struk Pesanan"}</title>
        <style>
          body { font-family: monospace; padding: 16px; color: #111; }
          h1 { text-align: center; font-size: 16px; margin: 0 0 4px; }
          p.sub { text-align: center; font-size: 11px; margin: 0 0 12px; color: #555; }
          table { width: 100%; font-size: 12px; border-collapse: collapse; }
          td { padding: 3px 0; vertical-align: top; }
          td.label { color: #555; width: 40%; }
          hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
          .total { font-weight: bold; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${pesanan.nama_toko ?? "Laundry"}</h1>
        <p class="sub">Struk Pesanan</p>
        <hr />
        <table>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td class="label">${label}</td><td>: ${value}</td></tr>`,
            )
            .join("")}
        </table>
        <hr />
        <table>
          <tr><td class="label">Total Layanan</td><td>: ${formatRupiah(pesanan.total_layanan)}</td></tr>
          <tr><td class="label">Biaya Antar Jemput</td><td>: ${formatRupiah(pesanan.biaya_antar_jemput)}</td></tr>
          <tr><td class="label">Diskon</td><td>: -${formatRupiah(pesanan.nilai_diskon)}</td></tr>
          <tr class="total"><td class="label">Total Bayar</td><td>: ${formatRupiah(pesanan.total_bayar)}</td></tr>
          <tr><td class="label">Jumlah Bayar</td><td>: ${formatRupiah(pesanan.jumlah_bayar)}</td></tr>
          <tr><td class="label">Kurang Bayar</td><td>: ${formatRupiah(pesanan.kurang_bayar)}</td></tr>
        </table>
        ${pesanan.catatan ? `<hr /><p style="font-size: 11px;">Catatan: ${pesanan.catatan}</p>` : ""}
        <hr />
        <p class="sub">Terima kasih telah mempercayakan cucian Anda kepada kami.</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.onafterprint = () => win.close();
}

export function PesananActionMenu({
  pesanan,
  onDeleteAction,
}: {
  pesanan: TabelPesanan;
  onDeleteAction?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      await deletePesanan(pesanan.id);
      onDeleteAction?.(pesanan.id);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete pesanan:", error);
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
                kirimWa({
                  noHp: pesanan.no_hp,
                  nama: pesanan.nama_pelanggan,
                  nomorPesanan: pesanan.nomor_pesanan,
                  totalBayar: pesanan.total_bayar,
                  statusPesanan: pesanan.status_pesanan,
                  statusPembayaran: pesanan.status_pembayaran,
                });
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
            <div className="my-1 border-t border-gray-100 dark:border-slate-800" />
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:text-red-400`}
              onClick={(e) => {
                // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
                e.stopPropagation();
                setOpen(false);
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

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deletePesanan(pesanan.id);
      if (onDeleteSuccessAction) {
        onDeleteSuccessAction();
      } else {
        router.push("/laundry/pesanan");
      }
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete pesanan:", error);
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
          className="flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600 transition-colors hover:bg-green-100 shadow-sm"
        >
          <span className="sr-only">Kirim WhatsApp</span>
          <MessageCircleIcon className="h-5 w-5" />
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={() => printStruk(pesanan)}
          title="Print Struk"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 shadow-sm"
        >
          <span className="sr-only">Print</span>
          <PrinterIcon className="h-5 w-5" />
        </button>

        {/* Edit */}
        <Link
          href={`/laundry/pesanan/${pesanan.id}/edit`}
          title="Edit Pesanan"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 shadow-sm"
        >
          <span className="sr-only">Edit</span>
          <PencilIcon className="h-5 w-5" />
        </Link>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            // stopPropagation agar tap tidak memicu onClick ancestor yang bisa diklik
            e.stopPropagation();
            setShowConfirm(true);
          }}
          title="Hapus Pesanan"
          className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/50 shadow-sm"
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

export function CreateItemPesananButton({ pesananId }: { pesananId: string }) {
  return (
    <Link
      href={`/laundry/pesanan/${pesananId}/item/create`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <PlusIcon className="h-4 w-4" />
      <span>Tambah Item Pesanan</span>
    </Link>
  );
}

export function UpdateItemPesananButton({
  pesananId,
  itemId,
}: {
  pesananId: string;
  itemId: string;
}) {
  return (
    <Link
      href={`/laundry/pesanan/${pesananId}/item/${itemId}/edit`}
      title="Edit Item"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-gray-100"
    >
      <span className="sr-only">Edit Item</span>
      <PencilIcon className="h-3.5 w-3.5" />
    </Link>
  );
}

export function DeleteItemPesananButton({
  pesananId,
  itemId,
  onDeleteAction,
}: {
  pesananId: string;
  itemId: string;
  onDeleteAction?: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await deleteItemPesanan(itemId, pesananId);
      onDeleteAction?.(itemId);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
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
        title="Hapus Item"
        className="flex h-7 w-7 touch-manipulation items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-red-950/50 dark:hover:text-red-400"
      >
        <span className="sr-only">Hapus Item</span>
        <TrashIcon className="h-3.5 w-3.5" />
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
