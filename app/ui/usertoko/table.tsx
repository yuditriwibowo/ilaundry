import { fetchFilteredUserToko, fetchUserTokoPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/usertoko/infinite-list";
import UserTokoTableRow from "@/app/ui/usertoko/table-row";
import NotFound from "@/app/laundry/pengaturan/not-found";

export default async function UserTokoTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const userTokoList = await fetchFilteredUserToko(query, currentPage);
  const totalPages = await fetchUserTokoPages(query);

  return (
    <div className="mt-6 flow-root">
      {userTokoList?.length === 0 ? (
        <NotFound />
      ) : (
        <div className="w-full">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              <InfiniteList 
                key={query}
                initialUserToko={userTokoList} 
                query={query} 
                totalPages={totalPages} 
              />
            </div>
            <div className="overflow-x-auto w-full">
              <table className="hidden w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nama User
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Nama Toko
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Peran
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {userTokoList?.map((item) => (
                    <UserTokoTableRow key={item.id || item.name} userToko={item} />
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
