"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ItemPesanan } from "@/app/lib/definitions";
import { fetchMoreItemPesanan } from "@/app/lib/actions";
import { formatRupiah } from "@/app/lib/utils";
import { useInView } from "react-intersection-observer";
import { StatusItemBadge } from "./status-item";
import { UpdateItemPesananButton, DeleteItemPesananButton } from "@/app/ui/pesanan/buttons";
import { TagIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function ItemPesananInfiniteList({
  pesananId,
  initialItems,
  totalPages,
}: {
  pesananId: string;
  initialItems: ItemPesanan[];
  totalPages: number;
}) {
  const [items, setItems] = useState<ItemPesanan[]>(initialItems);
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
      const moreItems = await fetchMoreItemPesanan(pesananId, nextPage);
      setItems((prev) => {
        const combined = [...prev, ...moreItems];
        return Array.from(new Map(combined.map((item) => [item.id, item])).values());
      });
      pageRef.current = nextPage;
    } catch (error) {
      console.error("Failed to fetch more item pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pesananId]);

  useEffect(() => {
    if (inView && pageRef.current < totalPages && !isLoading) {
      loadMore();
    }
  }, [inView, totalPages, isLoading, loadMore]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Belum ada item pesanan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow"
        >
          {/* Top Row: Nomor Item & Status */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5 font-medium text-xs text-primary-700">
              <TagIcon className="h-3.5 w-3.5" />
              <span>{item.nomor_item_pesanan ?? "Item"}</span>
            </div>
            <StatusItemBadge status={item.status_item} />
          </div>

          {/* Middle Row: Service Name & Metadata */}
          <div className="mt-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              {item.nama_layanan_snapshot}
            </h4>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              {item.tipe_layanan_snapshot && <span>{item.tipe_layanan_snapshot}</span>}
              {item.durasi_snapshot && (
                <>
                  <span>•</span>
                  <span>{item.durasi_snapshot}</span>
                </>
              )}
              {item.nama_parfum_snapshot && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5 text-indigo-600">
                    <SparklesIcon className="h-3 w-3" />
                    {item.nama_parfum_snapshot}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="mt-3 flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1.5 text-xs">
            <span className="text-gray-600">
              {item.jumlah} {item.satuan} × {formatRupiah(item.harga_satuan)}
            </span>
            <div className="text-right">
              {item.nilai_diskon && item.nilai_diskon > 0 ? (
                <span className="mr-1.5 text-red-500 line-through">
                  {formatRupiah(item.subtotal)}
                </span>
              ) : null}
              <span className="font-semibold text-gray-900 text-sm">
                {formatRupiah(item.subtotal_final ?? item.subtotal)}
              </span>
            </div>
          </div>

          {/* Catatan if exists */}
          {item.catatan_item ? (
            <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
              <span className="font-medium">Catatan:</span> {item.catatan_item}
            </p>
          ) : null}

          {/* Actions Row */}
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
            <UpdateItemPesananButton pesananId={pesananId} itemId={item.id} />
            <DeleteItemPesananButton
              pesananId={pesananId}
              itemId={item.id}
              onDeleteAction={handleDelete}
            />
          </div>
        </div>
      ))}

      <div ref={ref} className="flex h-8 items-center justify-center">
        {isLoading && <p className="text-xs text-gray-400">Memuat item lainnya...</p>}
      </div>
    </div>
  );
}
