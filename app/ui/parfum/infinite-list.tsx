"use client";

import { Droplets } from "lucide-react";
import { fetchMoreParfum } from "@/app/lib/actions";
import { Parfum } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import { UpdateParfum, DeleteParfum } from "@/app/ui/parfum/buttons";

const BASE = "/laundry/pengaturan/parfum";

export default function InfiniteList({
  initialParfum,
  query,
  totalPages,
}: {
  initialParfum: Parfum[];
  query: string;
  totalPages: number;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialParfum}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreParfum}
      renderItem={(parfum, remove) => (
        <EntityCard
          key={parfum.id}
          detailHref={`${BASE}/${parfum.id}/detail`}
          ariaLabel={`Lihat detail parfum ${parfum.nama_parfum}`}
          icon={Droplets}
          title={parfum.nama_parfum}
          actions={
            <>
              <UpdateParfum id={parfum.id} />
              <DeleteParfum id={parfum.id} onDeleteAction={remove} />
            </>
          }
        />
      )}
    />
  );
}

