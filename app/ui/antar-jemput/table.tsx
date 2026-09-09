import { fetchFilteredAntarJemput, fetchAntarJemputPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/antar-jemput/infinite-list";
import AntarJemputTableRow from "@/app/ui/antar-jemput/table-row";
import NotFound from "@/app/laundry/pengaturan/not-found";

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
        <div className="w-full">
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
              <table className="hidden w-full text-gray-900 md:table">
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
                    <AntarJemputTableRow key={antarJemput.id} antarJemput={antarJemput} />
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
