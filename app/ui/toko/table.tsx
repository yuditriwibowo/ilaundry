import { fetchFilteredToko, fetchTokoPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/toko/infinite-list";
import TokoTableRow from "@/app/ui/toko/table-row";
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
        <div className="w-full">
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
              <table className="hidden w-full text-gray-900 md:table">
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
                    <TokoTableRow key={toko.id} toko={toko} />
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
