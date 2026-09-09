import { fetchFilteredLayanan, fetchLayananPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/layanan/infinite-list";
import LayananTableRow from "@/app/ui/layanan/table-row";
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
        <div className="w-full">
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
              <table className="hidden w-full text-gray-900 md:table">
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
                    <LayananTableRow key={layanan.id} layanan={layanan} />
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
