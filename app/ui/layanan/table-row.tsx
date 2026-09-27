"use client";

import { PackageIcon } from "lucide-react";
import { UpdateLayanan, DeleteLayanan } from "@/app/ui/layanan/buttons";
import { TabelLayanan } from "@/app/lib/definitions";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/layanan";

export default function LayananTableRow({
  layanan,
  canManage = true,
}: {
  layanan: TabelLayanan;
  canManage?: boolean;
}) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${layanan.id}/detail`}
      actions={
        canManage ? (
          <>
            <UpdateLayanan id={layanan.id} />
            <DeleteLayanan id={layanan.id} />
          </>
        ) : null
      }
    >
      <EntityNameCell icon={PackageIcon} name={layanan.nama_layanan} />
      <td className="whitespace-nowrap px-3 py-3">
        {layanan.nama_tipe}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {layanan.nama_durasi ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ""}` : "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        Rp {layanan.harga.toLocaleString('id-ID')}
      </td>
    </EntityTableRow>
  );
}
