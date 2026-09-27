"use client";

import { TicketIcon } from "lucide-react";
import { UpdateDiskon, DeleteDiskon } from "@/app/ui/diskon/buttons";
import { Diskon } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/diskon";

export default function DiskonTableRow({
  diskon,
  canManage = true,
}: {
  diskon: Diskon;
  canManage?: boolean;
}) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${diskon.id}/detail`}
      actions={
        canManage ? (
          <>
            <UpdateDiskon id={diskon.id} />
            <DeleteDiskon id={diskon.id} />
          </>
        ) : null
      }
    >
      <EntityNameCell icon={TicketIcon} name={diskon.nama_diskon} />
      <td className="whitespace-nowrap px-3 py-3">
        {diskon.tipe_diskon}
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        {diskon.tipe_diskon === "Persentase" ? `${diskon.nilai_diskon}%` : formatRupiah(diskon.nilai_diskon)}
      </td>
    </EntityTableRow>
  );
}
