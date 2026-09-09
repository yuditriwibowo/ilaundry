import { fetchFilteredDurasi, fetchDurasiPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/durasi/infinite-list";
import DurasiTableRow from "@/app/ui/durasi/table-row";
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
        <div className="w-full">
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
              <table className="hidden w-full text-gray-900 md:table">
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
                    <DurasiTableRow key={durasi.id} durasi={durasi} />
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
