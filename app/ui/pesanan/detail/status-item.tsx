import clsx from "clsx";
import { StatusItem } from "@/app/lib/definitions";

const statusItemStyles: Record<StatusItem, string> = {
  diproses: "bg-amber-100 text-amber-700",
  selesai: "bg-green-100 text-green-700",
  diambil: "bg-gray-200 text-gray-600",
};

const statusItemLabels: Record<StatusItem, string> = {
  diproses: "Diproses",
  selesai: "Selesai",
  diambil: "Diambil",
};

export function StatusItemBadge({ status }: { status: StatusItem }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusItemStyles[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {statusItemLabels[status] ?? status}
    </span>
  );
}
