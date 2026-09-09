import { fetchFilteredDiskon, fetchDiskonPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/diskon/infinite-list";
import DiskonTableRow from "@/app/ui/diskon/table-row";
import NotFound from "@/app/laundry/pengaturan/not-found";

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
        <div className="w-full">
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
              <table className="hidden w-full text-gray-900 md:table">
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
                    <DiskonTableRow key={diskon.id} diskon={diskon} />
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
