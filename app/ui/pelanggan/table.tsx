import { fetchFilteredPelanggan, fetchPelangganPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/pelanggan/infinite-list";
import PelangganTableRow from "@/app/ui/pelanggan/table-row";

export default async function PelangganTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const pelangganList = await fetchFilteredPelanggan(query, currentPage);
  const totalPages = await fetchPelangganPages(query);

  return (
    <div className="mt-6 flow-root">
      <div className="w-full">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <InfiniteList 
              key={query}
              initialPelanggan={pelangganList} 
              query={query} 
              totalPages={totalPages} 
            />
          </div>
          <div className="overflow-x-auto w-full">
            <table className="hidden w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr className="border-b">
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Nama
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    No HP
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Email
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
                {pelangganList?.map((pelanggan) => (
                  <PelangganTableRow key={pelanggan.id} pelanggan={pelanggan} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

