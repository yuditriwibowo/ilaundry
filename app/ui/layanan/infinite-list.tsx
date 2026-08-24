"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { PackageIcon } from "lucide-react";
import { UpdateLayanan, DeleteLayanan } from "@/app/ui/layanan/buttons";
import { fetchMoreLayanan } from "@/app/lib/actions";
import { TabelLayanan } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default function InfiniteList({
  initialLayanan,
  query,
  totalPages,
}: {
  initialLayanan: TabelLayanan[];
  query: string;
  totalPages: number;
}) {
  const [layananList, setLayananList] = useState<TabelLayanan[]>(initialLayanan);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setLayananList((prev) => prev.filter((layanan) => layanan.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreLayanan = await fetchMoreLayanan(query, nextPage);
      setLayananList((prev) => {
        const combined = [...prev, ...moreLayanan];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more layanan:", error);
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
      {layananList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {layananList.map((layanan) => (
            <div
              key={layanan.id}
              className="mb-2 w-full rounded-md bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                    <PackageIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-base">{layanan.nama_layanan}</p>
                    <p className="text-gray-500">{layanan.nama_tipe} • {layanan.nama_durasi ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ""}` : "-"} • Rp {layanan.harga.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <UpdateLayanan id={layanan.id} />
                  <DeleteLayanan id={layanan.id} onDeleteAction={handleDelete} />
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
