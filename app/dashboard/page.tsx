import LaundryCard from "@/app/ui/dashboard/laundrycards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import { fetchRevenue } from "@/app/lib/data";

export default async function Page() {
  const revenue = await fetchRevenue();
  //console.log(revenue);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <LaundryCard
        totalRp={1000}
        totalPesanan={10}
        kiloanKg={10}
        satuanPcs={9}
        meteranM={20}
      />
      <RevenueChart revenue={revenue} />
    </div>
  );
}
