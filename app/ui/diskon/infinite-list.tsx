"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TicketIcon } from "lucide-react";
import { UpdateDiskon, DeleteDiskon } from "@/app/ui/diskon/buttons";
import { fetchMoreDiskon } from "@/app/lib/actions";
import { Diskon } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";
import { formatRupiah } from "@/app/lib/utils";

export default function InfiniteList({
  initialDiskon,
  query,
  totalPages,
}: {
  initialDiskon: Diskon[];
  query: string;
  totalPages: number;
}) {
  const [diskonList, setDiskonList] = useState<Diskon[]>(initialDiskon);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setDiskonList((prev) => prev.filter((diskon) => diskon.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreDiskon = await fetchMoreDiskon(query, nextPage);
      setDiskonList((prev) => {
        const combined = [...prev, ...moreDiskon];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more diskon:", error);
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
      {diskonList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {diskonList.map((diskon) => (
            <div
              key={diskon.id}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                    <TicketIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-base">{diskon.nama_diskon}</p>
                    <p className="text-gray-500">
                      Nilai: {diskon.tipe_diskon === "Persentase" ? `${diskon.nilai_diskon}%` : formatRupiah(diskon.nilai_diskon)}
                    </p>
                    <p className="text-xs text-gray-400 uppercase font-semibold">{diskon.tipe_diskon}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UpdateDiskon id={diskon.id} />
                  <DeleteDiskon id={diskon.id} onDeleteAction={handleDelete} />
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
