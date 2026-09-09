"use client";

import { useRouter } from "next/navigation";
import { PackageIcon } from "lucide-react";
import { UpdateLayanan, DeleteLayanan } from "@/app/ui/layanan/buttons";
import { TabelLayanan } from "@/app/lib/definitions";

export default function LayananTableRow({ layanan }: { layanan: TabelLayanan }) {
  const router = useRouter();

  return (
    <tr
      key={layanan.id}
      onClick={() => router.push(`/laundry/pengaturan/layanan/${layanan.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
            <PackageIcon className="h-4 w-4 text-white" />
          </div>
          <p className="font-medium">{layanan.nama_layanan}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {layanan.nama_tipe}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {layanan.nama_durasi ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ""}` : "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        Rp {layanan.harga.toLocaleString('id-ID')}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdateLayanan id={layanan.id} />
          <DeleteLayanan id={layanan.id} />
        </div>
      </td>
    </tr>
  );
}
