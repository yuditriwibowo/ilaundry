import LaundryCard from "@/app/ui/laundry/laundrycards";
import RevenueChart from "@/app/ui/laundry/revenue-chart";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
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
  );
}
