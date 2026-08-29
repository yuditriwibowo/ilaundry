import { Users } from "lucide-react";
import { UpdateUserToko, DeleteUserToko } from "@/app/ui/usertoko/buttons";
import { fetchFilteredUserToko, fetchUserTokoPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/usertoko/infinite-list";
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
        <div className="inline-block min-w-full align-middle">
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
              <table className="hidden min-w-[650px] w-full text-gray-900 md:table">
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
                  {userTokoList?.map((item, index) => {
                    const itemId = item.id || item.name;
                    return (
                      <tr
                        key={itemId}
                        className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                      >
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <p>{item.name}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {item.nama_toko}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {item.peran}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                          <div className="flex justify-end gap-3">
                            <UpdateUserToko id={itemId} />
                            <DeleteUserToko id={itemId} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
