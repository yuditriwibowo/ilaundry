import { TicketIcon } from "lucide-react";
import { UpdateDiskon, DeleteDiskon } from "@/app/ui/diskon/buttons";
import { fetchFilteredDiskon, fetchDiskonPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/diskon/infinite-list";
import NotFound from "@/app/laundry/pengaturan/not-found";
import { formatRupiah } from "@/app/lib/utils";

export default async function DiskonTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const diskonList = await fetchFilteredDiskon(query, currentPage);
  const totalPages = await fetchDiskonPages(query);

  return (
    <div className="mt-6 flow-root">
      {diskonList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialDiskon={diskonList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden min-w-[650px] w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Diskon
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Tipe
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Nilai
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {diskonList?.map((diskon) => (
                    <tr
                      key={diskon.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <p>{diskon.nama_diskon}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {diskon.tipe_diskon}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {diskon.tipe_diskon === "Persentase" ? `${diskon.nilai_diskon}%` : formatRupiah(diskon.nilai_diskon)}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateDiskon id={diskon.id} />
                          <DeleteDiskon id={diskon.id} />
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
