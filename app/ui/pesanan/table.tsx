import { PesananActionMenu } from "@/app/ui/pesanan/buttons";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import { fetchFilteredPesanan, fetchPesananPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/pesanan/infinite-list";
import { formatDateTimeToLocal, formatEstimasiJam, formatRupiah } from "@/app/lib/utils";
import { TabelPesanan } from "@/app/lib/definitions";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function PesananTable({
  query,
  currentPage,
  status,
  bayar,
}: {
  query: string;
  currentPage: number;
  status?: string;
  bayar?: string;
}) {
  const pesananList = await fetchFilteredPesanan(query, currentPage, status, bayar);
  const totalPages = await fetchPesananPages(query, status, bayar);

  return (
    <div className="mt-6 flow-root">
      {pesananList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="w-full">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList
                key={query + status + bayar}
                initialPesanan={pesananList}
                query={query}
                status={status ?? ""}
                bayar={bayar ?? ""}
                totalPages={totalPages}
              />
            </div>
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
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status Bayar
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pesananList?.map((pesanan: TabelPesanan) => (
                    <tr
                      key={pesanan.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
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
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end">
                          <PesananActionMenu pesanan={pesanan} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
