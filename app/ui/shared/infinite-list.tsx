/**
 * Client-only module — JANGAN diimpor dari Server Component.
 *
 * Directive `"use client"` sengaja TIDAK ditempatkan di sini:
 * plugin TypeScript Next.js (rule ts(71007)) memeriksa serializability
 * props semua komponen di file berdirective `"use client"`, sehingga
 * props `fetchMore` (referensi Server Action) dan `renderItem`
 * (render function) di file ini akan dianggap warning padahal
 * keduanya tidak pernah melewati boundary server→client.
 *
 * Modul ini hanya diimpor dari komponen `"use client"` (infinite-list
 * per domain), sehingga otomatis ikut terkompilasi ke client bundle
 * dan hooks di bawah tetap valid.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import NotFound from "@/app/laundry/pengaturan/not-found";

/**
 * Infinite scroll list generik untuk master data pengaturan.
 *
 * Meng-encapsulate logika yang sebelumnya diduplikasi di 8 file
 * infinite-list per domain (durasi, parfum, diskon, antar-jemput, layanan,
 * pelanggan, toko, usertoko):
 * - state list + pageRef (penanda halaman terakhir yang di-fetch)
 * - loadMore via server action `fetchMore` (query, page) => Promise<T[]>
 * - dedup berdasarkan id via Map (mencegah item ganda saat race)
 * - trigger otomatis saat sentinel masuk viewport (useInView)
 *
 * `renderItem` menerima item dan callback `remove(id)` untuk penghapusan
 * optimistik dari tombol hapus di dalam kartu.
 */
export default function InfiniteList<T extends { id: string }>({
  initialItems,
  query,
  totalPages,
  fetchMore,
  renderItem,
  emptyState,
}: {
  initialItems: T[];
  query: string;
  totalPages: number;
  fetchMore: (query: string, page: number) => Promise<T[]>;
  renderItem: (item: T, remove: (id: string) => void) => React.ReactNode;
  emptyState?: React.ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const moreItems = await fetchMore(query, nextPage);
      setItems((prev) => {
        const combined = [...prev, ...moreItems];
        return Array.from(
          new Map(combined.map((item) => [item.id, item])).values(),
        );
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, fetchMore]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  if (items.length === 0) {
    return <>{emptyState ?? <NotFound />}</>;
  }

  return (
    <>
      {items.map((item) => renderItem(item, handleDelete))}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
      </div>
    </>
  );
}
