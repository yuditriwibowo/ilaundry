"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Droplets } from "lucide-react";
import { UpdateParfum, DeleteParfum } from "@/app/ui/parfum/buttons";
import { fetchMoreParfum } from "@/app/lib/actions";
import { Parfum } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default function InfiniteList({
  initialParfum,
  query,
  totalPages,
}: {
  initialParfum: Parfum[];
  query: string;
  totalPages: number;
}) {
  const [parfumList, setParfumList] = useState<Parfum[]>(initialParfum);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setParfumList((prev) => prev.filter((parfum) => parfum.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreParfum = await fetchMoreParfum(query, nextPage);
      setParfumList((prev) => {
        const combined = [...prev, ...moreParfum];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more parfum:", error);
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
      {parfumList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {parfumList.map((parfum) => (
            <div
              key={parfum.id}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-base">{parfum.nama_parfum}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UpdateParfum id={parfum.id} />
                  <DeleteParfum id={parfum.id} onDeleteAction={handleDelete} />
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
