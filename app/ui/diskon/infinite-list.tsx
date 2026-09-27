"use client";

import { TicketIcon } from "lucide-react";
import { fetchMoreDiskon } from "@/app/lib/actions";
import { Diskon } from "@/app/lib/definitions";
import SharedInfiniteList from "@/app/ui/shared/infinite-list";
import { EntityCard } from "@/app/ui/shared/entity-card";
import { UpdateDiskon, DeleteDiskon } from "@/app/ui/diskon/buttons";
import { formatRupiah } from "@/app/lib/utils";

const BASE = "/laundry/pengaturan/diskon";

export default function InfiniteList({
  initialDiskon,
  query,
  totalPages,
  canManage = true,
}: {
  initialDiskon: Diskon[];
  query: string;
  totalPages: number;
  canManage?: boolean;
}) {
  return (
    <SharedInfiniteList
      initialItems={initialDiskon}
      query={query}
      totalPages={totalPages}
      fetchMore={fetchMoreDiskon}
      renderItem={(diskon, remove) => (
        <EntityCard
          key={diskon.id}
          detailHref={`${BASE}/${diskon.id}/detail`}
          ariaLabel={`Lihat detail diskon ${diskon.nama_diskon}`}
          icon={TicketIcon}
          title={diskon.nama_diskon}
          subtitle={
            <>
              Nilai:{" "}
              {diskon.tipe_diskon === "Persentase"
                ? `${diskon.nilai_diskon}%`
                : formatRupiah(diskon.nilai_diskon)}
              <span className="block truncate text-xs text-gray-400 uppercase font-semibold">
                {diskon.tipe_diskon}
              </span>
            </>
          }
          actions={
            canManage ? (
              <>
                <UpdateDiskon id={diskon.id} />
                <DeleteDiskon id={diskon.id} onDeleteAction={remove} />
              </>
            ) : null
          }
        />
      )}
    />
  );
}
