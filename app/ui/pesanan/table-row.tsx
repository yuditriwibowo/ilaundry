"use client";

import { useRouter } from "next/navigation";
import { PesananActionMenu } from "@/app/ui/pesanan/buttons";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";
import { TabelPesanan } from "@/app/lib/definitions";

export default function PesananTableRow({ pesanan }: { pesanan: TabelPesanan }) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/laundry/pesanan/${pesanan.id}/detail`)}
      className="w-full border-b py-3 text-sm last-of-type:border-none cursor-pointer transition-colors hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-primary-600">
        {pesanan.nomor_pesanan ?? "-"}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <p className="font-medium">{pesanan.nama_pelanggan ?? "-"}</p>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {formatDateTimeToLocal(pesanan.tgl_pesanan)}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {(() => {
          const estimasi = formatEstimasiJam(pesanan.tgl_estimasi_selesai);
          if (!estimasi) return "-";
          return (
            <span
              className={estimasi.terlambat ? "font-medium text-red-600" : "text-gray-500"}
              title={
                pesanan.tgl_estimasi_selesai
                  ? formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)
                  : undefined
              }
            >
              {estimasi.text}
            </span>
          );
        })()}
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-medium">
        {formatRupiah(pesanan.total_bayar)}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <StatusPesananBadge status={pesanan.status_pesanan} />
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <StatusPembayaranBadge status={pesanan.status_pembayaran} />
      </td>
      <td
        className="whitespace-nowrap py-3 pl-6 pr-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <PesananActionMenu pesanan={pesanan} />
        </div>
      </td>
    </tr>
  );
}
