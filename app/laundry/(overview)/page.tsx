import LaundryCard from "@/app/ui/laundry/laundrycards";
import RevenueChart from "@/app/ui/laundry/revenue-chart";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";
import { fetchToko } from "@/app/lib/data";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stores = await fetchToko();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="relative w-full max-w-xs">
          <select className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 bg-white text-black">
            <option value="">Pilih Toko</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.nama_toko}
              </option>
            ))}
          </select>
          <BuildingStorefrontIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <LaundryCard
          totalRp={1285000}
          totalPesanan={23}
          kiloanKg={116}
          satuanPcs={12}
          meteranM={20}
        />
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
      </div>
    </div>
  );
}
