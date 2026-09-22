import { formatRupiah, formatDateTimeToLocal } from "@/app/lib/utils";
import type { BarisLaporanKas } from "@/app/lib/data/kas";

/**
 * Tabel daftar transaksi keuangan untuk halaman Laporan Kas
 * (tampilan landscape / desktop).
 *
 * Dipisah dari page.tsx mengikuti pola tabel project
 * (app/ui/pelanggan/table.tsx dst). Pagination dirender terpisah
 * di page.tsx memakai komponen Pagination (app/ui/pagination.tsx).
 *
 * Kolom Nilai menggabungkan Debet & Kredit menjadi satu kolom:
 * - Debet  -> nilai positif (+), tampil hijau (kas masuk)
 * - Kredit -> nilai negatif (-), tampil merah (kas keluar)
 * Selaras dengan tampilan infinite list di mobile portrait.
 */
export default function LaporanKasTable({
  transaksi,
}: {
  transaksi: BarisLaporanKas[];
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="hidden w-full text-gray-900 md:table">
        <thead className="rounded-lg text-left text-sm font-normal">
          <tr className="border-b">
            <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
              Waktu
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Transaksi
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Tipe
            </th>
            <th scope="col" className="px-3 py-5 font-medium">
              Keterangan
            </th>
            <th
              scope="col"
              className="px-3 py-5 text-right font-medium sm:pr-6"
            >
              Nilai
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {transaksi.map((item) => {
            const debet = Number(item.nilai_debet) || 0;
            const kredit = Number(item.nilai_kredit) || 0;
            const isMasuk = debet > 0;
            return (
              <tr
                key={item.id}
                className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  {item.waktu_transaksi
                    ? formatDateTimeToLocal(item.waktu_transaksi)
                    : "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span className="font-medium">
                    {item.nama_transaksi ?? "-"}
                  </span>
                  {item.nomor_pesanan ? (
                    <span className="block text-xs text-gray-500">
                      {item.nomor_pesanan}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {item.tipe_transaksi === "tunai" ? "Tunai" : "Non Tunai"}
                </td>
                <td className="px-3 py-3">
                  <span className="block max-w-[240px] truncate">
                    {item.keterangan || "-"}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-3 text-right font-medium sm:pr-6 ${
                    isMasuk ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isMasuk
                    ? `+${formatRupiah(debet)}`
                    : `-${formatRupiah(kredit)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
