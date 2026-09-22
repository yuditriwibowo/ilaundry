"use client";

/**
 * Infinite scroll list pesanan untuk halaman Laporan Pesanan
 * (tampilan mobile portrait). Tampilan card disamakan dengan infinite-list
 * menu Pesanan (app/ui/pesanan/infinite-list.tsx), tapi read-only:
 * tanpa action menu & tanpa navigasi ke detail.
 * Pola scroll sama: useInView + server action fetchMoreLaporanPesanan +
 * dedup berdasarkan id.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { fetchMoreLaporanPesanan } from "@/app/lib/actions";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import { getInitials } from "@/app/ui/pesanan/infinite-list";
import { TabelPesanan } from "@/app/lib/definitions";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";
import NotFound from "@/app/laundry/laporan/pesanan/not-found";

export default function LaporanPesananInfiniteList({
  initialPesanan,
  mulai,
  sampai,
  totalPages,
}: {
  initialPesanan: TabelPesanan[];
  mulai: string;
  sampai: string;
  totalPages: number;
}) {
  const [pesananList, setPesananList] = useState<TabelPesanan[]>(initialPesanan);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const nextPage = pageRef.current + 1;
    try {
      const morePesanan = await fetchMoreLaporanPesanan(mulai, sampai, nextPage);
      setPesananList((prev) => {
        const combined = [...prev, ...morePesanan];
        return Array.from(
          new Map(combined.map((item) => [item.id, item])).values(),
        );
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more pesanan laporan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mulai, sampai]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  if (pesananList.length === 0) {
    return <NotFound />;
  }

  return (
    <>
      {pesananList.map((pesanan) => (
        <div
          key={pesanan.id}
          className="mb-2.5 w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800"
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
          </div>
        </div>
      ))}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isLoading && <p className="text-sm text-gray-500">Loading more...</p>}
      </div>
    </>
  );
}