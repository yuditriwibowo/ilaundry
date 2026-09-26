"use client";

import { Megaphone } from "lucide-react";
import { fetchMoreInfoIklan } from "@/app/lib/actions";
import { InfoIklan } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import { UpdateInfoIklan, DeleteInfoIklan } from "@/app/ui/info-iklan/buttons";

const BASE = "/laundry/pengaturan/info-iklan";

export default function InfiniteList({
  initialItems,
  query,
  totalPages,
}: {
  initialItems: InfoIklan[];
  query: string;
  totalPages: number;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialItems}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreInfoIklan}
      renderItem={(infoIklan, remove) => (
        <EntityCard
          key={infoIklan.id}
          detailHref={`${BASE}/${infoIklan.id}/detail`}
          ariaLabel={`Lihat detail info/iklan ${infoIklan.title ?? ""}`}
          icon={Megaphone}
          title={infoIklan.title ?? "(tanpa judul)"}
          subtitle={infoIklan.description ?? undefined}
          actions={
            <>
              <UpdateInfoIklan id={infoIklan.id} />
              <DeleteInfoIklan id={infoIklan.id} onDeleteAction={remove} />
            </>
          }
        />
      )}
    />
  );
}