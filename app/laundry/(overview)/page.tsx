import LaundryCard from "@/app/ui/laundry/laundrycards";
import RevenueChart from "@/app/ui/laundry/revenue-chart";
import SelectToko from "@/app/ui/laundry/select-toko";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";
import { fetchToko } from "@/app/lib/data";
import { CreateToko } from "@/app/ui/button";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stores = await fetchToko();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-4">
        <SelectToko stores={stores} />
        <CreateToko />
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
