"use client";

import { Droplets } from "lucide-react";
import { UpdateParfum, DeleteParfum } from "@/app/ui/parfum/buttons";
import { Parfum } from "@/app/lib/definitions";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/parfum";

export default function ParfumTableRow({ parfum }: { parfum: Parfum }) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${parfum.id}/detail`}
      actions={
        <>
          <UpdateParfum id={parfum.id} />
          <DeleteParfum id={parfum.id} />
        </>
      }
    >
      <EntityNameCell icon={Droplets} name={parfum.nama_parfum} />
    </EntityTableRow>
  );
}

