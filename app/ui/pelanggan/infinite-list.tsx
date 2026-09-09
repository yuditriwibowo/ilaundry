"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { UpdatePelanggan, DeletePelanggan } from "@/app/ui/pelanggan/buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import { fetchMorePelanggan } from "@/app/lib/actions";
import { Pelanggan } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";

export default function InfiniteList({
  initialPelanggan,
  query,
  totalPages,
}: {
  initialPelanggan: Pelanggan[];
  query: string;
  totalPages: number;
}) {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>(initialPelanggan);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setPelangganList((prev) => prev.filter((pelanggan) => pelanggan.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const morePelanggan = await fetchMorePelanggan(query, nextPage);
      setPelangganList((prev) => {
        const combined = [...prev, ...morePelanggan];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more pelanggan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  return (
    <>
      {pelangganList.map((pelanggan) => (
        <div
          key={pelanggan.id}
          className="mb-2 w-full rounded-lg bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2 text-sm">
            <div className="flex min-w-0 gap-3">
              {pelanggan.image_url ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={pelanggan.image_url}
                      className="object-cover"
                      fill
                      sizes="32px"
                      alt={`${pelanggan.nama}'s profile picture`}
                    />

                </div>
              ) : null}
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-base font-medium text-gray-900">
                  {pelanggan.nama}
                </p>
                <p className="truncate text-gray-500">{pelanggan.no_hp}</p>
                <p className="truncate text-gray-500">{pelanggan.email || "-"}</p>
                <p className="truncate text-gray-500">{pelanggan.alamat || "-"}</p>
              </div>
            </div>
             <div className="flex shrink-0 gap-2">
               <UpdatePelanggan id={pelanggan.id} />
                <DeletePelanggan id={pelanggan.id} onDeleteAction={handleDelete} />

             </div>

          </div>
        </div>
      ))}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
      </div>
    </>
  );
}
