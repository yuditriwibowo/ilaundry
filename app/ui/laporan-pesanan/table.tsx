import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import type { TabelPesanan } from "@/app/lib/definitions";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";

/**
 * Tabel daftar pesanan untuk halaman Laporan Pesanan
 * (tampilan landscape / desktop).
 *
 * Kolom & style disamakan dengan tabel menu Pesanan
 * (app/ui/pesanan/table.tsx + table-row.tsx), tapi read-only:
 * tanpa kolom Aksi & tanpa navigasi ke detail.
 * Pagination dirender terpisah di page.tsx memakai komponen Pagination.
 */
export default function LaporanPesananTable({
  pesananList,
}: {
  pesananList: TabelPesanan[];
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="hidden w-full text-gray-900 md:table">
        <thead className="rounded-lg text-left text-sm font-normal">
          <tr className="border-b">
            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
              No. Pesanan
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Pelanggan
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Tanggal Masuk
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Estimasi Selesai
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Total Bayar
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Status Pesanan
            </th>
            <th
              scope="col"
              className="px-3 py-5 font-medium sm:pr-6"
            >
              Status Bayar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {pesananList.map((pesanan) => (
            <tr
              key={pesanan.id}
              className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
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
                        Selesai : {formatDateTimeToLocal(pesanan.tgl_selesai)}
                      </span>
                    );
                  }
                  const estimasi = formatEstimasiJam(pesanan.tgl_estimasi_selesai);
                  if (!estimasi) return "-";
                  return (
                    <span
                      className={
                        estimasi.terlambat
                          ? "font-medium text-red-600"
                          : "text-gray-500"
                      }
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
              <td className="whitespace-nowrap px-3 py-3 sm:pr-6">
                <StatusPembayaranBadge status={pesanan.status_pembayaran} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}