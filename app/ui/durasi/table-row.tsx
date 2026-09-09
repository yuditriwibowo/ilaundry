"use client";

import { useRouter } from "next/navigation";
import { ClockIcon } from "lucide-react";
import { UpdateDurasi, DeleteDurasi } from "@/app/ui/durasi/buttons";
import { Durasi } from "@/app/lib/definitions";

export default function DurasiTableRow({ durasi }: { durasi: Durasi }) {
  const router = useRouter();

  return (
    <tr
      key={durasi.id}
      onClick={() => router.push(`/laundry/pengaturan/durasi/${durasi.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <ClockIcon className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{durasi.nama_durasi}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : "-"}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateDurasi id={durasi.id} />
          <DeleteDurasi id={durasi.id} />
        </div>
      </td>
    </tr>
  );
}
