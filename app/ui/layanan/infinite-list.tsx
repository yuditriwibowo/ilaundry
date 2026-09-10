"use client";

import { PackageIcon } from "lucide-react";
import { UpdateLayanan, DeleteLayanan } from "@/app/ui/layanan/buttons";
import { fetchMoreLayanan } from "@/app/lib/actions";
import { TabelLayanan } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import NotFound from "@/app/laundry/pengaturan/not-found";

const BASE = "/laundry/pengaturan/layanan";

export default function InfiniteList({
  initialLayanan,
  query,
  totalPages,
}: {
  initialLayanan: TabelLayanan[];
  query: string;
  totalPages: number;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialLayanan}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreLayanan}
      emptyState={<NotFound />}
      renderItem={(layanan, remove) => (
        <EntityCard
          key={layanan.id}
          detailHref={`${BASE}/${layanan.id}/detail`}
          ariaLabel={`Lihat detail layanan ${layanan.nama_layanan}`}
          icon={PackageIcon}
          title={layanan.nama_layanan}
          subtitle={
            <>
              {layanan.nama_tipe} •{" "}
              {layanan.nama_durasi
                ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ""}`
                : "-"}{" "}
              • Rp {layanan.harga.toLocaleString("id-ID")}
            </>
          }
          actions={
            <>
              <UpdateLayanan id={layanan.id} />
              <DeleteLayanan id={layanan.id} onDeleteAction={remove} />
            </>
          }
        />
      )}
    />
  );
}
