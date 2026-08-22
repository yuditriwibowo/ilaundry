"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Store } from "lucide-react";
import { UpdateToko, DeleteToko } from "@/app/ui/toko/buttons";
import { fetchMoreToko } from "@/app/lib/actions";
import { Toko } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";

export default function InfiniteList({
  initialToko,
  query,
  totalPages,
}: {
  initialToko: Toko[];
  query: string;
  totalPages: number;
}) {
  const [tokoList, setTokoList] = useState<Toko[]>(initialToko);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreToko = await fetchMoreToko(query, nextPage);
      setTokoList((prev) => {
        const combined = [...prev, ...moreToko];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more toko:", error);
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
      {tokoList.map((toko) => (
        <div
          key={toko.id}
          className="mb-2 w-full rounded-md bg-white p-4"
        >
          <div className="flex items-start justify-between gap-4 text-sm">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="font-medium text-base">{toko.nama_toko}</p>
                <p className="text-gray-500">{toko.telephone || "-"}</p>
                <p className="text-gray-500">{toko.alamat_toko || "-"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <UpdateToko id={toko.id} />
              <DeleteToko id={toko.id} />
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
