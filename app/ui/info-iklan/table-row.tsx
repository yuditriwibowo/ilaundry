"use client";

import { Megaphone } from "lucide-react";
import { UpdateInfoIklan, DeleteInfoIklan } from "@/app/ui/info-iklan/buttons";
import { InfoIklan } from "@/app/lib/definitions";
import { EntityTableRow, EntityNameCell } from "@/app/ui/shared/entity-card";

const BASE = "/laundry/pengaturan/info-iklan";

export default function InfoIklanTableRow({
  infoIklan,
}: {
  infoIklan: InfoIklan;
}) {
  return (
    <EntityTableRow
      detailHref={`${BASE}/${infoIklan.id}/detail`}
      actions={
        <>
          <UpdateInfoIklan id={infoIklan.id} />
          <DeleteInfoIklan id={infoIklan.id} />
        </>
      }
    >
      <EntityNameCell icon={Megaphone} name={infoIklan.title ?? "(tanpa judul)"} />
    </EntityTableRow>
  );
}