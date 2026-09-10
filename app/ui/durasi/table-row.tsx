"use client";

import { ClockIcon } from "lucide-react";
import { UpdateDurasi, DeleteDurasi } from "@/app/ui/durasi/buttons";
import { Durasi } from "@/app/lib/definitions";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/durasi";

export default function DurasiTableRow({ durasi }: { durasi: Durasi }) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${durasi.id}/detail`}
      actions={
        <>
          <UpdateDurasi id={durasi.id} />
          <DeleteDurasi id={durasi.id} />
        </>
      }
    >
      <EntityNameCell icon={ClockIcon} name={durasi.nama_durasi} />
      <td className="whitespace-nowrap px-3 py-3">
        {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : "-"}
      </td>
    </EntityTableRow>
  );
}

