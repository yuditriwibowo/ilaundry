import Image from "next/image";
import { UpdatePelanggan, DeletePelanggan } from "@/app/ui/pelanggan/buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import { fetchFilteredPelanggan, fetchPelangganPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/pelanggan/infinite-list";

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
      <div className="inline-block min-w-full align-middle">
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
            <table className="hidden min-w-[750px] w-full text-gray-900 md:table">
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
                  <tr
                    key={pelanggan.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        {pelanggan.image_url ? (
                          <Image
                            src={pelanggan.image_url}
                            className="rounded-full"
                            width={28}
                            height={28}
                            alt={`${pelanggan.nama}'s profile picture`}
                          />
                        ) : null}
                        <p>{pelanggan.nama}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {pelanggan.no_hp}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {pelanggan.email || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {pelanggan.alamat || "-"}
                    </td>

                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdatePelanggan id={pelanggan.id} />
                        <DeletePelanggan id={pelanggan.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

