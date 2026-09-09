"use client";

import { useRouter } from "next/navigation";
import { TicketIcon } from "lucide-react";
import { UpdateDiskon, DeleteDiskon } from "@/app/ui/diskon/buttons";
import { Diskon } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";

export default function DiskonTableRow({ diskon }: { diskon: Diskon }) {
  const router = useRouter();

  return (
    <tr
      key={diskon.id}
      onClick={() => router.push(`/laundry/pengaturan/diskon/${diskon.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <TicketIcon className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{diskon.nama_diskon}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {diskon.tipe_diskon}
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        {diskon.tipe_diskon === "Persentase" ? `${diskon.nilai_diskon}%` : formatRupiah(diskon.nilai_diskon)}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateDiskon id={diskon.id} />
          <DeleteDiskon id={diskon.id} />
        </div>
      </td>
    </tr>
  );
}
