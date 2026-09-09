import { fetchFilteredParfum, fetchParfumPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/parfum/infinite-list";
import ParfumTableRow from "@/app/ui/parfum/table-row";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function ParfumTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const parfumList = await fetchFilteredParfum(query, currentPage);
  const totalPages = await fetchParfumPages(query);

  return (
    <div className="mt-6 flow-root">
      {parfumList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="w-full">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialParfum={parfumList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama Parfum
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {parfumList?.map((parfum) => (
                    <ParfumTableRow key={parfum.id} parfum={parfum} />
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
