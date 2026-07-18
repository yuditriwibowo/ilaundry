import { Card } from "@/app/ui/dashboard/cards";
import LaundryCard from "@/app/ui/dashboard/laundrycards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { lusitana } from "@/app/ui/fonts";
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from "@/app/lib/data";

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  console.log(latestInvoices);
  return (
    <main>
      
      
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-1 items-start">
        <LaundryCard
          totalRp={1000}
          totalPesanan={10}
          kiloanKg={10}
          satuanPcs={9}
          meteranM={20}
        />
        <RevenueChart revenue={revenue} />
      </div>
    </main>
  );
}
