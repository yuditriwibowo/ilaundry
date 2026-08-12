import Image from "next/image";
import { UpdatePelanggan, DeletePelanggan } from "@/app/ui/pelanggan/buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import { fetchFilteredPelanggan } from "@/app/lib/data";

export default async function PelangganTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const pelangganList = await fetchFilteredPelanggan(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {pelangganList?.map((pelanggan) => (
              <div
                key={pelanggan.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex gap-3">
                    {pelanggan.image_url ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={pelanggan.image_url}
                          className="object-cover"
                          fill
                          alt={`${pelanggan.nama}'s profile picture`}
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col">
                      <p className="font-medium text-base">{pelanggan.nama}</p>
                      <p className="text-gray-500">{pelanggan.no_hp}</p>
                      <p className="text-gray-500">{pelanggan.email || "-"}</p>
                      <p className="text-gray-500">{pelanggan.alamat || "-"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateToLocal(pelanggan.tgl_daftar)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UpdatePelanggan id={pelanggan.id} />
                    <DeletePelanggan id={pelanggan.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
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
                <th scope="col" className="px-3 py-5 font-medium">
                  Tgl Daftar
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
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(pelanggan.tgl_daftar)}
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
  );
}

