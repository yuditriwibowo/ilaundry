"use client";

import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { UpdateAntarJemput, DeleteAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { AntarJemput } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";

export default function AntarJemputTableRow({ antarJemput }: { antarJemput: AntarJemput }) {
  const router = useRouter();

  return (
    <tr
      key={antarJemput.id}
      onClick={() => router.push(`/laundry/pengaturan/antar-jemput/${antarJemput.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{antarJemput.nama_antar_jemput}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        {formatRupiah(antarJemput.harga_antar_jemput)}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateAntarJemput id={antarJemput.id} />
          <DeleteAntarJemput id={antarJemput.id} />
        </div>
      </td>
    </tr>
  );
}
