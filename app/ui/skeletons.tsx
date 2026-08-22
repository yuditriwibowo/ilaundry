// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function LaundryCardSkeleton() {
  return (
    <div className="w-full h-full">
      <div className={`${shimmer} relative overflow-hidden w-full h-full rounded-xl bg-gray-100 p-5 shadow-md flex flex-col justify-between`}>
        {/* Header Skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 w-20 rounded-md bg-gray-200" />
              <div className="h-4 w-16 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="h-6 w-28 rounded-md bg-gray-200" />
            <div className="h-4 w-20 rounded-md bg-gray-200" />
          </div>
        </div>

        {/* Divider Skeleton */}
        <div className="h-[1px] w-full bg-gray-200 my-4" />

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-3 text-center mt-2 gap-2">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-16 rounded-md bg-gray-200" />
            <div className="h-4 w-12 rounded-md bg-gray-200" />
          </div>
          <div className="border-x border-gray-200 px-2 flex flex-col items-center space-y-2">
            <div className="h-8 w-16 rounded-md bg-gray-200" />
            <div className="h-4 w-12 rounded-md bg-gray-200" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-16 rounded-md bg-gray-200" />
            <div className="h-4 w-12 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <LaundryCardSkeleton />;
}

export function CardsSkeleton() {
  return <LaundryCardSkeleton />;
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden`}>
      <div className="rounded-xl bg-gray-50 p-0">
        <div className="sm:grid-cols-13 mt-0 grid h-[240px] grid-cols-12 items-end gap-2 rounded-md bg-white p-0 md:gap-4">
          <div className="mb-6 hidden h-[200px] flex-col justify-between sm:flex">
            <div className="h-3 w-8 rounded-md bg-gray-200" />
            <div className="h-3 w-8 rounded-md bg-gray-200" />
            <div className="h-3 w-8 rounded-md bg-gray-200" />
            <div className="h-3 w-8 rounded-md bg-gray-200" />
            <div className="h-3 w-8 rounded-md bg-gray-200" />
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full h-[150px] rounded-md bg-gray-200" />
              <div className="h-4 w-8 rounded-md bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LaundrySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <TokoActionsSkeleton />
      <LaundryCardSkeleton />
      <QuickActionsSkeleton />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Date */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Status */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function PelangganMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100" />
          <div className="flex flex-col">
            <div className="h-5 w-32 rounded bg-gray-100 mb-1" />
            <div className="h-4 w-24 rounded bg-gray-100 mb-1" />
            <div className="h-4 w-28 rounded bg-gray-100 mb-1" />
            <div className="h-4 w-36 rounded bg-gray-100 mb-1" />

          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}


export function PelangganTableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Nama */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-100"></div>
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* No HP */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Alamat */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-40 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-8 w-8 rounded bg-gray-100"></div>
          <div className="h-8 w-8 rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function PelangganTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <PelangganMobileSkeleton />
            <PelangganMobileSkeleton />
            <PelangganMobileSkeleton />
            <PelangganMobileSkeleton />
            <PelangganMobileSkeleton />
            <PelangganMobileSkeleton />
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

              </tr>
            </thead>
            <tbody className="bg-white">
              <PelangganTableRowSkeleton />
              <PelangganTableRowSkeleton />
              <PelangganTableRowSkeleton />
              <PelangganTableRowSkeleton />
              <PelangganTableRowSkeleton />
              <PelangganTableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th
                  scope="col"
                  className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl gap-3 text-center shadow-sm"
        >
          <div className={`${shimmer} relative overflow-hidden w-12 h-12 bg-gray-100 rounded-full`} />
          <div className={`${shimmer} relative overflow-hidden h-4 w-20 rounded-md bg-gray-200`} />
        </div>
      ))}
    </div>
  );
}

export function TokoMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-200" />
          <div className="flex flex-col">
            <div className="h-5 w-32 rounded bg-gray-100 mb-1" />
            <div className="h-4 w-24 rounded bg-gray-100 mb-1" />
            <div className="h-4 w-28 rounded bg-gray-100 mb-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function TokoTableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gray-200"></div>
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-24 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-40 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-8 w-8 rounded bg-gray-100"></div>
          <div className="h-8 w-8 rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function TokoTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <TokoMobileSkeleton />
            <TokoMobileSkeleton />
            <TokoMobileSkeleton />
            <TokoMobileSkeleton />
            <TokoMobileSkeleton />
            <TokoMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr className="border-b">
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Nama Toko</th>
                <th scope="col" className="px-3 py-5 font-medium">Telepon</th>
                <th scope="col" className="px-3 py-5 font-medium">Alamat</th>
                <th scope="col" className="relative py-3 pl-6 pr-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TokoTableRowSkeleton />
              <TokoTableRowSkeleton />
              <TokoTableRowSkeleton />
              <TokoTableRowSkeleton />
              <TokoTableRowSkeleton />
              <TokoTableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function TokoActionsSkeleton() {
  return (
    <div className="flex justify-end gap-4">
      <div className={`${shimmer} relative overflow-hidden h-10 w-64 rounded-md bg-gray-200`} />
      <div className={`${shimmer} relative overflow-hidden h-10 w-32 rounded-lg bg-gray-200`} />
    </div>
  );
}
