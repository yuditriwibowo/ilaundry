import LaundryCard from "@/app/ui/dashboard/laundrycards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import { fetchRevenue } from "@/app/lib/data";

export default async function Page() {
  const revenue = await fetchRevenue();
  //console.log(revenue);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <LaundryCard
        totalRp={1285000}
        totalPesanan={23}
        kiloanKg={10}
        satuanPcs={12}
        meteranM={20}
      />
      <RevenueChart revenue={revenue} />
    </div>
  );
}
