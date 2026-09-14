import { CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { StatusPesanan, StatusPembayaran } from "@/app/lib/definitions";

const statusPesananStyles: Record<StatusPesanan, string> = {
  diproses: "bg-amber-100 text-amber-700 font-bold dark:bg-amber-950/50 dark:text-amber-400",
  selesai: "bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950/50 dark:text-emerald-400",
  diambil: "bg-slate-100 text-slate-600 border border-slate-200 font-bold dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  batal: "bg-red-100 text-red-700 font-bold dark:bg-red-950/50 dark:text-red-400",
};

const statusPesananLabels: Record<StatusPesanan, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
  batal: "Batal",
};

export function StatusPesananBadge({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        statusPesananStyles[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {statusPesananLabels[status] ?? status}
    </span>
  );
}

const statusPembayaranStyles: Record<StatusPembayaran, string> = {
  belum_bayar: "bg-red-100 text-red-700 font-bold dark:bg-red-950/50 dark:text-red-400",
  DP: "bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-950/50 dark:text-indigo-400",
  lunas: "bg-emerald-500 text-white font-bold",
};

const statusPembayaranLabels: Record<StatusPembayaran, string> = {
  belum_bayar: "Belum Bayar",
  DP: "DP",
  lunas: "Lunas",
};

export function StatusPembayaranBadge({ status }: { status: StatusPembayaran }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        statusPembayaranStyles[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {status === "lunas" ? <CheckIcon className="w-3.5" /> : null}
      {statusPembayaranLabels[status] ?? status}
    </span>
  );
}
