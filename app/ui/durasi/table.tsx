import { ClockIcon } from "lucide-react";
import { UpdateDurasi, DeleteDurasi } from "@/app/ui/durasi/buttons";
import { fetchFilteredDurasi, fetchDurasiPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/durasi/infinite-list";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function DurasiTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const durasiList = await fetchFilteredDurasi(query, currentPage);
  const totalPages = await fetchDurasiPages(query);

  return (
    <div className="mt-6 flow-root">
      {durasiList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialDurasi={durasiList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden min-w-[650px] w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Durasi
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Lama Durasi
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {durasiList?.map((durasi) => (
                    <tr
                      key={durasi.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                            <ClockIcon className="h-4 w-4 text-white" />
                          </div>
                          <p>{durasi.nama_durasi}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {durasi.lama_durasi ? `${durasi.lama_durasi} jam` : "-"}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateDurasi id={durasi.id} />
                          <DeleteDurasi id={durasi.id} />
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
