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
          className="mb-2 w-full rounded-md bg-white p-4"
        >
          <div className="flex items-start justify-between gap-4 text-sm">
            <div className="flex gap-3">
              {pelanggan.image_url ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <Image
                      src={pelanggan.image_url}
                      className="object-cover"
                      fill
                      sizes="32px"
                      alt={`${pelanggan.nama}'s profile picture`}
                    />

                </div>
              ) : null}
              <div className="flex flex-col">
                <p className="font-medium text-base">{pelanggan.nama}</p>
                <p className="text-gray-500">{pelanggan.no_hp}</p>
                <p className="text-gray-500">{pelanggan.email || "-"}</p>
                <p className="text-gray-500">{pelanggan.alamat || "-"}</p>

              </div>
            </div>
            <div className="flex gap-2">
              <UpdatePelanggan id={pelanggan.id} />
              <DeletePelanggan id={pelanggan.id} />
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
