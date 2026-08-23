import { Store } from "lucide-react";
import { UpdateToko, DeleteToko } from "@/app/ui/toko/buttons";
import { fetchFilteredToko, fetchTokoPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/toko/infinite-list";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function TokoTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const tokoList = await fetchFilteredToko(query, currentPage);
  const totalPages = await fetchTokoPages(query);

  return (
    <div className="mt-6 flow-root">
      {tokoList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialToko={tokoList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden min-w-[650px] w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Toko
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Telepon
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Alamat
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {tokoList?.map((toko) => (
                    <tr
                      key={toko.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                            <Store className="h-4 w-4 text-white" />
                          </div>
                          <p>{toko.nama_toko}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {toko.telephone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {toko.alamat_toko || "-"}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateToko id={toko.id} />
                          <DeleteToko id={toko.id} />
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
