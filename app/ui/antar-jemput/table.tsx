import { Truck } from "lucide-react";
import { UpdateAntarJemput, DeleteAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { fetchFilteredAntarJemput, fetchAntarJemputPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/antar-jemput/infinite-list";
import NotFound from "@/app/laundry/pengaturan/not-found";
import { formatRupiah } from "@/app/lib/utils";

export default async function AntarJemputTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const antarJemputList = await fetchFilteredAntarJemput(query, currentPage);
  const totalPages = await fetchAntarJemputPages(query);

  return (
    <div className="mt-6 flow-root">
      {antarJemputList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialAntarJemput={antarJemputList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden min-w-[650px] w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Antar-Jemput
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
                  {antarJemputList?.map((antarJemput) => (
                    <tr
                      key={antarJemput.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                            <Truck className="h-4 w-4 text-white" />
                          </div>
                          <p>{antarJemput.nama_antar_jemput}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatRupiah(antarJemput.harga_antar_jemput)}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateAntarJemput id={antarJemput.id} />
                          <DeleteAntarJemput id={antarJemput.id} />
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
