"use client";

import { Truck } from "lucide-react";
import { fetchMoreAntarJemput } from "@/app/lib/actions";
import { AntarJemput } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import { UpdateAntarJemput, DeleteAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { formatRupiah } from "@/app/lib/utils";

const BASE = "/laundry/pengaturan/antar-jemput";

export default function InfiniteList({
  initialAntarJemput,
  query,
  totalPages,
}: {
  initialAntarJemput: AntarJemput[];
  query: string;
  totalPages: number;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialAntarJemput}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreAntarJemput}
      renderItem={(antarJemput, remove) => (
        <EntityCard
          key={antarJemput.id}
          detailHref={`${BASE}/${antarJemput.id}/detail`}
          ariaLabel={`Lihat detail antar-jemput ${antarJemput.nama_antar_jemput}`}
          icon={Truck}
          title={antarJemput.nama_antar_jemput}
          subtitle={
            <>Harga: {formatRupiah(antarJemput.harga_antar_jemput)}</>
          }
          actions={
            <>
              <UpdateAntarJemput id={antarJemput.id} />
              <DeleteAntarJemput id={antarJemput.id} onDeleteAction={remove} />
            </>
          }
        />
      )}
    />
  );
}
