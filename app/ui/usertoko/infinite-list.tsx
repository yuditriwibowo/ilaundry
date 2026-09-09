"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { UpdateUserToko, DeleteUserToko } from "@/app/ui/usertoko/buttons";
import { fetchMoreUserToko } from "@/app/lib/actions";
import { TabelUserToko } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default function InfiniteList({
  initialUserToko,
  query,
  totalPages,
}: {
  initialUserToko: TabelUserToko[];
  query: string;
  totalPages: number;
}) {
  const [userTokoList, setUserTokoList] = useState<TabelUserToko[]>(initialUserToko);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);
  const router = useRouter();

  const handleDelete = useCallback((id: string) => {
    setUserTokoList((prev) => prev.filter((item) => (item.id || item.name) !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreUserToko = await fetchMoreUserToko(query, nextPage);
      setUserTokoList((prev) => {
        const combined = [...prev, ...moreUserToko];
        return Array.from(new Map(combined.map(item => [item.id || item.name, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more user toko:", error);
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
      {userTokoList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {userTokoList.map((item) => {
            const itemId = item.id || item.name;
            return (
              <div
                key={itemId}
                role="button"
                aria-label={`Lihat detail user toko ${item.name}`}
                tabIndex={0}
                onClick={() => router.push(`/laundry/pengaturan/usertoko/${itemId}/detail`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/laundry/pengaturan/usertoko/${itemId}/detail`);
                  }
                }}
                className="mb-2 w-full rounded-lg bg-white p-4 shadow-sm cursor-pointer transition-colors hover:bg-gray-50 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2 text-sm">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-base font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="truncate text-gray-500">Toko: {item.nama_toko}</p>
                      <p className="truncate text-gray-500">Peran: {item.peran}</p>
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UpdateUserToko id={itemId} />
                    <DeleteUserToko id={itemId} onDeleteAction={handleDelete} />
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={ref} className="h-10 flex items-center justify-center">
            {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
          </div>
        </>
      )}
    </>
  );
}
