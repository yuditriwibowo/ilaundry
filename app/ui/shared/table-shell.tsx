import NotFound from "@/app/laundry/pengaturan/not-found";
import type { ReactNode } from "react";

/**
 * Chrome presentasional tabel master data pengaturan:
 * - empty state (NotFound)
 * - versi mobile (biasanya InfiniteList) vs desktop (tabel)
 * - thead generik dari array header + kolom aksi (sr-only "Edit")
 *
 * Komponen ini server-compatible (tidak pakai hook client).
 */
export default function TableShell({
  isEmpty,
  mobile,
  headers,
  children,
}: {
  isEmpty: boolean;
  mobile: ReactNode;
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="mt-6 flow-root">
      {isEmpty ? (
        <NotFound />
      ) : (
        <div className="w-full">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">{mobile}</div>
            <div className="overflow-x-auto w-full">
              <table className="hidden w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    {headers.map((header, i) => (
                      <th
                        key={header}
                        scope="col"
                        className={
                          i === 0
                            ? "px-4 py-5 font-medium sm:pl-6"
                            : "px-3 py-5 font-medium"
                        }
                      >
                        {header}
                      </th>
                    ))}
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">{children}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
