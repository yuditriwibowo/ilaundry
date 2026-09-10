"use client";

import { ClockIcon } from "lucide-react";
import { fetchMoreDurasi } from "@/app/lib/actions";
import { Durasi } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import { UpdateDurasi, DeleteDurasi } from "@/app/ui/durasi/buttons";

const BASE = "/laundry/pengaturan/durasi";

export default function InfiniteList({
  initialDurasi,
  query,
  totalPages,
}: {
  initialDurasi: Durasi[];
  query: string;
  totalPages: number;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialDurasi}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreDurasi}
      renderItem={(durasi, remove) => (
        <EntityCard
          key={durasi.id}
          detailHref={`${BASE}/${durasi.id}/detail`}
          ariaLabel={`Lihat detail durasi ${durasi.nama_durasi ?? ''}`}
          icon={ClockIcon}
          title={durasi.nama_durasi}
          subtitle={
            <>
              Lama Durasi: {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : "-"}
            </>
          }
          actions={
            <>
              <UpdateDurasi id={durasi.id} />
              <DeleteDurasi id={durasi.id} onDeleteAction={remove} />
            </>
          }
        />
      )}
    />
  );
}

