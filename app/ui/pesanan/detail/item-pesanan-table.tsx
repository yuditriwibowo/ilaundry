"use client";

import { useState, useCallback } from "react";
import { ItemPesanan } from "@/app/lib/definitions";
import { formatRupiah } from "@/app/lib/utils";
import { StatusItemBadge } from "./status-item";
import { UpdateItemPesananButton, DeleteItemPesananButton } from "@/app/ui/pesanan/buttons";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function ItemPesananTable({
  pesananId,
  initialItems,
}: {
  pesananId: string;
  initialItems: ItemPesanan[];
}) {
  const [items, setItems] = useState<ItemPesanan[]>(initialItems);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Belum ada item pesanan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-3.5 py-3">
              No. Item
            </th>
            <th scope="col" className="px-3.5 py-3">
              Layanan
            </th>
            <th scope="col" className="px-3.5 py-3">
              Status
            </th>
            <th scope="col" className="px-3.5 py-3">
              Qty
            </th>
            <th scope="col" className="px-3.5 py-3">
              Harga
            </th>
            <th scope="col" className="px-3.5 py-3">
              Nilai Diskon
            </th>
            <th scope="col" className="px-3.5 py-3">
              Subtotal
            </th>
            <th scope="col" className="px-3.5 py-3">
              Catatan
            </th>
            <th scope="col" className="px-3.5 py-3 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="whitespace-nowrap px-3.5 py-3 font-medium text-primary-600">
                {item.nomor_item_pesanan ?? "-"}
              </td>
              <td className="px-3.5 py-3">
                <div className="font-medium text-gray-900">{item.nama_layanan_snapshot}</div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
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
              </td>
              <td className="whitespace-nowrap px-3.5 py-3">
                <StatusItemBadge status={item.status_item} />
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 text-gray-700">
                {item.jumlah} {item.satuan}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 text-gray-700">
                {formatRupiah(item.harga_satuan)}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 text-red-600">
                {item.nilai_diskon && item.nilai_diskon > 0
                  ? `- ${formatRupiah(item.nilai_diskon)}`
                  : "-"}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 font-medium text-gray-900">
                {item.nilai_diskon && item.nilai_diskon > 0 ? (
                  <div className="text-xs text-red-500 line-through">
                    {formatRupiah(item.subtotal)}
                  </div>
                ) : null}
                <div>{formatRupiah(item.subtotal_final ?? item.subtotal)}</div>
              </td>
              <td className="max-w-[180px] truncate px-3.5 py-3 text-xs text-gray-500" title={item.catatan_item ?? ""}>
                {item.catatan_item || "-"}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 text-right">
                <div className="flex justify-end gap-1.5">
                  <UpdateItemPesananButton pesananId={pesananId} itemId={item.id} />
                  <DeleteItemPesananButton
                    pesananId={pesananId}
                    itemId={item.id}
                    onDeleteAction={handleDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
