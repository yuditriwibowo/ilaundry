"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Truck } from "lucide-react";
import { UpdateAntarJemput, DeleteAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { fetchMoreAntarJemput } from "@/app/lib/actions";
import { AntarJemput } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";
import { formatRupiah } from "@/app/lib/utils";

export default function InfiniteList({
  initialAntarJemput,
  query,
  totalPages,
}: {
  initialAntarJemput: AntarJemput[];
  query: string;
  totalPages: number;
}) {
  const [antarJemputList, setAntarJemputList] = useState<AntarJemput[]>(initialAntarJemput);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setAntarJemputList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreAntarJemput = await fetchMoreAntarJemput(query, nextPage);
      setAntarJemputList((prev) => {
        const combined = [...prev, ...moreAntarJemput];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more antar-jemput:", error);
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
      {antarJemputList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {antarJemputList.map((antarJemput) => (
            <div
              key={antarJemput.id}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-base">{antarJemput.nama_antar_jemput}</p>
                    <p className="text-gray-500">
                      Harga: {formatRupiah(antarJemput.harga_antar_jemput)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UpdateAntarJemput id={antarJemput.id} />
                  <DeleteAntarJemput id={antarJemput.id} onDeleteAction={handleDelete} />
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
