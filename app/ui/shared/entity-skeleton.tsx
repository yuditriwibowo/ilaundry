/**
 * Skeleton generik untuk tabel master data pengaturan.
 * Menggantikan ~15 skeleton per-domain di skeletons.tsx.
 */

function MobileCardSkeleton() {
  return (
    <div className="mb-2 w-full rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 text-sm">
        <div className="flex min-w-0 gap-3">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-200" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <div className="h-8 w-8 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="w-full border-b border-gray-100 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gray-200"></div>
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </div>
      </td>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <td key={i} className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </td>
      ))}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-8 w-8 rounded bg-gray-100"></div>
          <div className="h-8 w-8 rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

/**
 * Skeleton tabel lengkap: 6 kartu mobile + tabel desktop dengan
 * `columns` kolom data (plus kolom aksi otomatis).
 */
export function EntityTableSkeleton({
  headers,
}: {
  headers: string[];
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="w-full">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <MobileCardSkeleton key={i} />
            ))}
          </div>
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
            <tbody className="bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={headers.length} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
