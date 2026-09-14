"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PesananActionMenu } from "@/app/ui/pesanan/buttons";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import { fetchMorePesanan } from "@/app/lib/actions";
import { TabelPesanan } from "@/app/lib/definitions";
import { useInView } from "react-intersection-observer";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";
import NotFound from "@/app/laundry/pesanan/not-found";

export function getInitials(nama: string | null) {
  if (!nama) return "?";
  return nama
    .split(" ")
    .map((word) => word.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function InfiniteList({
  initialPesanan,
  query,
  status,
  bayar,
  totalPages,
}: {
  initialPesanan: TabelPesanan[];
  query: string;
  status: string;
  bayar: string;
  totalPages: number;
}) {
  const router = useRouter();
  const [pesananList, setPesananList] = useState<TabelPesanan[]>(initialPesanan);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const handleDelete = useCallback((id: string) => {
    setPesananList((prev) => prev.filter((pesanan) => pesanan.id !== id));
  }, []);

  // Mengganti baris dengan data terbaru setelah update status/pembayaran sukses
  const handleUpdate = useCallback((updated: TabelPesanan) => {
    setPesananList((prev) =>
      prev.map((pesanan) => (pesanan.id === updated.id ? updated : pesanan)),
    );
  }, []);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const morePesanan = await fetchMorePesanan(query, nextPage, status, bayar);
      setPesananList((prev) => {
        const combined = [...prev, ...morePesanan];
        return Array.from(new Map(combined.map((item) => [item.id, item])).values());
      });
      setPage(nextPage);
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, status, bayar]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  return (
    <>
      {pesananList.length === 0 ? (
        <NotFound />
      ) : (
        <>
          {pesananList.map((pesanan) => (
            <div
              key={pesanan.id}
              role="button"
              aria-label={`Lihat detail pesanan ${pesanan.nomor_pesanan ?? ''}`}
              onClick={() => router.push(`/laundry/pesanan/${pesanan.id}/detail`)}
              className="mb-2.5 w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 cursor-pointer transition-all hover:border-blue-300 dark:bg-slate-900 dark:border-slate-800 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2 text-sm">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:border-blue-900/60 dark:text-blue-300">
                    {getInitials(pesanan.nama_pelanggan)}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate text-base font-medium text-gray-900">
                      {pesanan.nama_pelanggan ?? "-"}
                    </p>
                    {pesanan.nomor_pesanan ? (
                      <p className="flex items-center gap-1 truncate text-gray-500">
                        {pesanan.nomor_pesanan}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusPesananBadge status={pesanan.status_pesanan} />
                  <StatusPembayaranBadge status={pesanan.status_pembayaran} />
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-900">
                    {formatRupiah(pesanan.total_bayar)}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    Masuk : {formatDateTimeToLocal(pesanan.tgl_pesanan)}
                    {(() => {
                      // Saat pesanan sudah selesai/diambil, tampilkan tanggal
                      // selesai (bukan lagi estimasi)
                      if (
                        (pesanan.status_pesanan === "selesai" ||
                          pesanan.status_pesanan === "diambil") &&
                        pesanan.tgl_selesai
                      ) {
                        return (
                          <span
                            className="font-medium text-green-600"
                            title="Tanggal Selesai"
                          >
                            {" • "}Selesai :{" "}
                            {formatDateTimeToLocal(pesanan.tgl_selesai)}
                          </span>
                        );
                      }
                      const estimasi = formatEstimasiJam(pesanan.tgl_estimasi_selesai);
                      return (
                        <span
                          className={estimasi?.terlambat ? "font-medium text-red-600" : ""}
                          title={
                            pesanan.tgl_estimasi_selesai
                              ? formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)
                              : undefined
                          }
                        >
                          {" • "}Est : {estimasi ? estimasi.text : "-"}
                        </span>
                      );
                    })()}
                  </p>
                </div>
                <div className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
                  <PesananActionMenu
                    pesanan={pesanan}
                    onDeleteAction={handleDelete}
                    onUpdateAction={handleUpdate}
                  />
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
