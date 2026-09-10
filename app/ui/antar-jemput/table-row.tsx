"use client";

import { Truck } from "lucide-react";
import { UpdateAntarJemput, DeleteAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { AntarJemput } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/antar-jemput";

export default function AntarJemputTableRow({ antarJemput }: { antarJemput: AntarJemput }) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${antarJemput.id}/detail`}
      actions={
        <>
          <UpdateAntarJemput id={antarJemput.id} />
          <DeleteAntarJemput id={antarJemput.id} />
        </>
      }
    >
      <EntityNameCell icon={Truck} name={antarJemput.nama_antar_jemput} />
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        {formatRupiah(antarJemput.harga_antar_jemput)}
      </td>
    </EntityTableRow>
  );
}
