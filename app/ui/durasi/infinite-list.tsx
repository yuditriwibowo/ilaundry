"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ClockIcon } from "lucide-react";
import { UpdateDurasi, DeleteDurasi } from "@/app/ui/durasi/buttons";
import { fetchMoreDurasi } from "@/app/lib/actions";
import { Durasi } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default function InfiniteList({
  initialDurasi,
  query,
  totalPages,
}: {
  initialDurasi: Durasi[];
  query: string;
  totalPages: number;
}) {
  const [durasiList, setDurasiList] = useState<Durasi[]>(initialDurasi);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setDurasiList((prev) => prev.filter((durasi) => durasi.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreDurasi = await fetchMoreDurasi(query, nextPage);
      setDurasiList((prev) => {
        const combined = [...prev, ...moreDurasi];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more durasi:", error);
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
      {durasiList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {durasiList.map((durasi) => (
            <div
              key={durasi.id}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-base">{durasi.nama_durasi}</p>
                    <p className="text-gray-500">Lama Durasi: {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : "-"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UpdateDurasi id={durasi.id} />
                  <DeleteDurasi id={durasi.id} onDeleteAction={handleDelete} />
                </div>
              </div>
            </div>
          ))}
          <div ref={ref} className="h-10 flex items-center justify-center">
            {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
          </div>
        </>
      )}
    </>
  );

}
