import {
  ViewPesananDetail,
  KirimWaPesanan,
  PrintPesanan,
  UpdatePesanan,
  DeletePesanan,
} from "@/app/ui/pesanan/buttons";
import {
  StatusPesananBadge,
  StatusPembayaranBadge,
} from "@/app/ui/pesanan/status";
import { fetchFilteredPesanan, fetchPesananPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/pesanan/infinite-list";
import { formatDateTimeToLocal, formatRupiah } from "@/app/lib/utils";
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
                      Tanggal & Estimasi
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Bayar
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status
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
                        <div className="flex flex-col">
                          <p className="font-medium">{pesanan.nama_pelanggan ?? "-"}</p>
                          <p className="text-gray-500">{pesanan.no_hp ?? "-"}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex flex-col">
                          <p>{formatDateTimeToLocal(pesanan.tgl_pesanan)}</p>
                          {pesanan.tgl_estimasi_selesai ? (
                            <p className="text-gray-500">
                              Estimasi: {formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium">
                        {formatRupiah(pesanan.total_bayar)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusPesananBadge status={pesanan.status_pesanan} />
                          <StatusPembayaranBadge status={pesanan.status_pembayaran} />
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-1.5">
                          <ViewPesananDetail id={pesanan.id} />
                          <KirimWaPesanan
                            noHp={pesanan.no_hp}
                            nama={pesanan.nama_pelanggan}
                            nomorPesanan={pesanan.nomor_pesanan}
                            totalBayar={pesanan.total_bayar}
                            statusPesanan={pesanan.status_pesanan}
                            statusPembayaran={pesanan.status_pembayaran}
                          />
                          <PrintPesanan pesanan={pesanan} />
                          <UpdatePesanan id={pesanan.id} />
                          <DeletePesanan id={pesanan.id} />
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
