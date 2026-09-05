import { CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { StatusPesanan, StatusPembayaran } from "@/app/lib/definitions";

const statusPesananStyles: Record<StatusPesanan, string> = {
  baru: "bg-blue-100 text-blue-700",
  diproses: "bg-amber-100 text-amber-700",
  selesai: "bg-green-100 text-green-700",
  diambil: "bg-gray-200 text-gray-600",
};

const statusPesananLabels: Record<StatusPesanan, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
};

export function StatusPesananBadge({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusPesananStyles[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {statusPesananLabels[status] ?? status}
    </span>
  );
}

const statusPembayaranStyles: Record<StatusPembayaran, string> = {
  belum_bayar: "bg-red-100 text-red-700",
  DP: "bg-indigo-100 text-indigo-700",
  lunas: "bg-green-500 text-white",
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
