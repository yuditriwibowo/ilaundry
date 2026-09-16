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
  ArrowPathIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deletePesanan,
  updateStatusPesanan,
  updatePembayaranPesanan,
  updateStatusItemPesanan,
  deleteItemPesanan,
} from "@/app/lib/actions";
import { TabelPesanan, ItemPesanan, StatusPesanan, StatusPembayaran, StatusItem, MetodePembayaran } from "@/app/lib/definitions";
import { formatDateTimeToLocal, formatRupiah } from "@/app/lib/utils";

const actionButtonClass =
  "flex h-8 w-8 touch-manipulation items-center justify-center rounded-xl border p-1.5 transition-all";

export function CreatePesanan() {
  return (
    <Link
      href="/laundry/pesanan/create"
      className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 text-blue-600 md:border-transparent md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:text-white px-4 text-sm font-bold transition-all hover:bg-blue-50 md:hover:from-blue-700 md:hover:to-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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

const statusItemText: Record<StatusItem, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

const statusPesananText: Record<StatusPesanan, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

export const metodePembayaranText: Record<MetodePembayaran, string> = {
  tunai: "Tunai",
  non_tunai: "Non Tunai",
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
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
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
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
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
      className={`${actionButtonClass} border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400`}
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
      className={`${actionButtonClass} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
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
    ["Metode Bayar", pesanan.metode_pembayaran ? metodePembayaranText[pesanan.metode_pembayaran] : "-"],
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

// Struk per item pesanan: satu layanan pada sebuah pesanan.
// Data pesanan (toko/pelanggan) dipakai untuk kop struk, data item untuk isi.
export function printStrukItem(pesanan: TabelPesanan, item: ItemPesanan) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;

  const rows: [string, string][] = [
    ["No. Pesanan", pesanan.nomor_pesanan ?? "-"],
    ["No. Item", item.nomor_item_pesanan ?? "-"],
    [
      "Tanggal",
      item.tgl_item_pesanan
        ? formatDateTimeToLocal(item.tgl_item_pesanan)
        : formatDateTimeToLocal(pesanan.tgl_pesanan),
    ],
    ["Pelanggan", pesanan.nama_pelanggan ?? "-"],
    ["No. HP", pesanan.no_hp ?? "-"],
    ["Kasir", pesanan.nama_user ?? "-"],
    ["Status Pesanan", statusPesananText[pesanan.status_pesanan]],
    ["Status Item", statusItemText[item.status_item]],
  ];

  const itemRows: [string, string][] = [
    ["Layanan", item.nama_layanan_snapshot],
    ["Tipe", item.tipe_layanan_snapshot ?? "-"],
    ["Durasi", item.durasi_snapshot ?? "-"],
    ["Parfum", item.nama_parfum_snapshot ?? "-"],
    ["Qty", `${item.jumlah} ${item.satuan}`],
    ["Harga Satuan", formatRupiah(item.harga_satuan)],
    [
      "Diskon",
      item.nilai_diskon && item.nilai_diskon > 0
        ? `- ${formatRupiah(item.nilai_diskon)}`
        : "-",
    ],
  ];

  win.document.write(`
    <html>
      <head>
        <title>${item.nomor_item_pesanan ?? "Struk Item"} - ${pesanan.nomor_pesanan ?? "Pesanan"}</title>
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
        <p class="sub">Struk Item Pesanan</p>
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
          ${itemRows
            .map(
              ([label, value]) =>
                `<tr><td class="label">${label}</td><td>: ${value}</td></tr>`,
            )
            .join("")}
        </table>
        <hr />
        <table>
          <tr><td class="label">Subtotal</td><td>: ${formatRupiah(item.subtotal)}</td></tr>
          <tr class="total"><td class="label">Total Item</td><td>: ${formatRupiah(item.subtotal_final ?? item.subtotal)}</td></tr>
        </table>
        ${item.catatan_item ? `<hr /><p style="font-size: 11px;">Catatan: ${item.catatan_item}</p>` : ""}
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

      {/* Modal Update Status Pesanan */}
      <UpdateStatusPesananModal
        pesanan={pesanan}
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSuccessAction={(updated) => onUpdateAction?.(updated)}
      />

      {/* Modal Update Pembayaran */}
      <UpdatePembayaranModal
        pesanan={pesanan}
        show={showPembayaranModal}
        onClose={() => setShowPembayaranModal(false)}
        onSuccessAction={(updated) => onUpdateAction?.(updated)}
      />
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPembayaranModal, setShowPembayaranModal] = useState(false);
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

// ---------- Modal Update Status Pesanan ----------
// Nilai form dikelola lokal (bukan FormData) karena update dilakukan lewat
// server action terpisah, bukan submit form create/update pesanan.
function UpdateStatusPesananModal({
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
      onClose();
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
            onClick={onClose}
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

// ---------- Tombol Update Status Pesanan (halaman detail) ----------
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

      <UpdateStatusPesananModal
        pesanan={pesanan}
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccessAction={onSuccessAction}
      />
    </>
  );
}

// ---------- Modal Update Pembayaran Pesanan ----------
// Hanya mengubah jumlah_bayar & metode_pembayaran; status_pembayaran dan
// kurang_bayar dihitung ulang di server dari total_bayar saat ini.
function UpdatePembayaranModal({
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

// ---------- Tombol Update Pembayaran (halaman detail) ----------
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

      <UpdatePembayaranModal
        pesanan={pesanan}
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccessAction={onSuccessAction}
      />
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

      {/* Modal Update Status Item Pesanan */}
      <UpdateStatusItemModal
        item={item}
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSuccessAction={(updated) => onUpdateAction?.(updated)}
      />
    </>
  );
}

// ---------- Modal Update Status Item Pesanan ----------
// Nilai form dikelola lokal (bukan FormData) karena update dilakukan lewat
// server action terpisah. Pola sama dengan UpdateStatusPesananModal.
function UpdateStatusItemModal({
  item,
  show,
  onClose,
  onSuccessAction,
}: {
  item: ItemPesanan;
  show: boolean;
  onClose: () => void;
  onSuccessAction?: (updated: ItemPesanan) => void;
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<StatusItem>(
    item.status_item,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset pilihan ke status terbaru setiap kali modal dibuka (pola resmi React)
  const [prevItem, setPrevItem] = useState(item);
  const [prevShow, setPrevShow] = useState(show);
  if ((show && !prevShow) || item.status_item !== prevItem.status_item) {
    setPrevShow(show);
    setPrevItem(item);
    setSelectedStatus(item.status_item);
    setErrorMsg(null);
  }

  if (!show) return null;

  async function handleSave() {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const result = await updateStatusItemPesanan(
        item.id,
        item.pesanan_id,
        selectedStatus,
      );
      if (!result.success || !result.item) {
        setErrorMsg(result.message ?? "Gagal memperbarui status item.");
        return;
      }
      router.refresh();
      onSuccessAction?.(result.item);
      onClose();
    } catch (error) {
      console.error("Failed to update status item pesanan:", error);
      setErrorMsg("Gagal memperbarui status item.");
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
          Update Status Item
        </h3>
        <p className="mb-4 truncate text-sm text-gray-500 dark:text-slate-400">
          {item.nomor_item_pesanan ?? "Item"} • {item.nama_layanan_snapshot}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {(Object.keys(statusItemText) as StatusItem[]).map((status) => {
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
                {statusItemText[status]}
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
            onClick={onClose}
            className="flex-1 touch-manipulation rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSaving || selectedStatus === item.status_item}
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

