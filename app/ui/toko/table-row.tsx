"use client";

import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { UpdateToko, DeleteToko } from "@/app/ui/toko/buttons";
import { Toko } from "@/app/lib/definitions";

export default function TokoTableRow({ toko }: { toko: Toko }) {
  const router = useRouter();

  return (
    <tr
      key={toko.id}
      onClick={() => router.push(`/laundry/pengaturan/toko/${toko.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <Store className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{toko.nama_toko}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {toko.telephone || "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {toko.alamat_toko || "-"}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateToko id={toko.id} />
          <DeleteToko id={toko.id} />
        </div>
      </td>
    </tr>
  );
}
