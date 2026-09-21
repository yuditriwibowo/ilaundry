"use client";

/**
 * Infinite scroll list transaksi keuangan untuk halaman Laporan Kas
 * (tampilan mobile portrait). Pola sama dengan infinite-list pelanggan:
 * useInView + server action fetchMoreLaporanKas + dedup berdasarkan id.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { fetchMoreLaporanKas } from "@/app/lib/actions";
import { formatDateTimeToLocal, formatRupiah } from "@/app/lib/utils";
import { BarisLaporanKas } from "@/app/lib/data/kas";
import NotFound from "@/app/laundry/laporan/kas/not-found";

export default function LaporanKasInfiniteList({
  initialItems,
  mulai,
  sampai,
  totalPages,
}: {
  initialItems: BarisLaporanKas[];
  mulai: string;
  sampai: string;
  totalPages: number;
}) {
  const [items, setItems] = useState<BarisLaporanKas[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const more = await fetchMoreLaporanKas(mulai, sampai, nextPage);
      setItems((prev) => {
        const combined = [...prev, ...more];
        return Array.from(
          new Map(combined.map((item) => [item.id, item])).values(),
        );
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more transaksi kas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mulai, sampai]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  if (items.length === 0) {
    return <NotFound />;
  }

  return (
    <>
      {items.map((item) => {
        const debet = Number(item.nilai_debet) || 0;
        const kredit = Number(item.nilai_kredit) || 0;
        const isMasuk = debet > 0;
        return (
          <div
            key={item.id}
            className="mb-2 w-full rounded-lg bg-white p-4 shadow-sm border border-gray-200/80"
          >
            <div className="flex items-start justify-between gap-2 text-sm">
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-base font-medium text-gray-900">
                  {item.nama_transaksi ?? "-"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {item.waktu_transaksi
                    ? formatDateTimeToLocal(item.waktu_transaksi)
                    : "-"}
                  {item.nomor_pesanan ? ` • ${item.nomor_pesanan}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  isMasuk
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {item.tipe_transaksi === "tunai" ? "Tunai" : "Non Tunai"}
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs text-gray-500">
                  {item.keterangan || "-"}
                </p>
              </div>
              <p
                className={`shrink-0 text-base font-semibold ${
                  isMasuk ? "text-green-600" : "text-red-600"
                }`}
              >
                {isMasuk ? `+${formatRupiah(debet)}` : `-${formatRupiah(kredit)}`}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
      </div>
    </>
  );
}
