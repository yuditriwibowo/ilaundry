import { PackageIcon } from "lucide-react";
import { UpdateLayanan, DeleteLayanan } from "@/app/ui/layanan/buttons";
import { fetchFilteredLayanan, fetchLayananPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/layanan/infinite-list";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function LayananTable({
  query,
  currentPage,
  tipeId,
  durasiNama,
}: {
  query: string;
  currentPage: number;
  tipeId?: string;
  durasiNama?: string;
}) {
  const layananList = await fetchFilteredLayanan(query, currentPage, tipeId, durasiNama);
  const totalPages = await fetchLayananPages(query, tipeId, durasiNama);

  return (
    <div className="mt-6 flow-root">
      {layananList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query + tipeId + durasiNama}
                initialLayanan={layananList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden min-w-[800px] w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Layanan
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Tipe
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Durasi
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Harga
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {layananList?.map((layanan) => (
                    <tr
                      key={layanan.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                            <PackageIcon className="h-4 w-4 text-white" />
                          </div>
                          <p>{layanan.nama_layanan}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {layanan.nama_tipe}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {layanan.nama_durasi ? `${layanan.nama_durasi}${layanan.lama_durasi ? ` - ${layanan.lama_durasi} Jam` : ""}` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        Rp {layanan.harga.toLocaleString('id-ID')}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateLayanan id={layanan.id} />
                          <DeleteLayanan id={layanan.id} />
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
