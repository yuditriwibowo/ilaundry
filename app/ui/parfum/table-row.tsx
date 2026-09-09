"use client";

import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import { UpdateParfum, DeleteParfum } from "@/app/ui/parfum/buttons";
import { Parfum } from "@/app/lib/definitions";

export default function ParfumTableRow({ parfum }: { parfum: Parfum }) {
  const router = useRouter();

  return (
    <tr
      key={parfum.id}
      onClick={() => router.push(`/laundry/pengaturan/parfum/${parfum.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{parfum.nama_parfum}</p>
        </div>
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateParfum id={parfum.id} />
          <DeleteParfum id={parfum.id} />
        </div>
      </td>
    </tr>
  );
}
