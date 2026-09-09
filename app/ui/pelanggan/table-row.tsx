"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { UpdatePelanggan, DeletePelanggan } from "@/app/ui/pelanggan/buttons";
import { Pelanggan } from "@/app/lib/definitions";

export default function PelangganTableRow({ pelanggan }: { pelanggan: Pelanggan }) {
  const router = useRouter();

  return (
    <tr
      key={pelanggan.id}
      onClick={() => router.push(`/laundry/pelanggan/${pelanggan.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          {pelanggan.image_url ? (
            <Image
              src={pelanggan.image_url}
              className="rounded-full"
              width={28}
              height={28}
              alt={`${pelanggan.nama}'s profile picture`}
            />
          ) : null}
          <p className="font-medium">{pelanggan.nama}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {pelanggan.no_hp}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {pelanggan.email || "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {pelanggan.alamat || "-"}
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          <UpdatePelanggan id={pelanggan.id} />
          <DeletePelanggan id={pelanggan.id} />
        </div>
      </td>
    </tr>
  );
}
