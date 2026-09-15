import LaundryCard from "@/app/ui/laundry/laundrycards";
import QuickActions from "@/app/ui/laundry/quick-actions";
import InfoCarousel from "@/app/ui/laundry/info-carousel";
import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchToko, fetchRingkasanHariIni } from "@/app/lib/data";
import { CreateToko } from "@/app/ui/button";
import { cookies } from "next/headers";
import YlaundryLogo from "@/app/ui/ylaundry-logo";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stores = await fetchToko();
  const ringkasan = await fetchRingkasanHariIni();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || "";

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
        <div className="flex flex-col md:flex-row w-full items-start md:items-center gap-4 md:gap-0">
          <div className="block landscape:hidden md:hidden w-full">
            <YlaundryLogo />
          </div>
          <div className="w-full flex items-center gap-4 justify-between">
            <SelectToko stores={stores} selectedToko={selectedToko} />
            <CreateToko />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <LaundryCard
            totalRp={ringkasan.totalRp}
            totalPesanan={ringkasan.totalPesanan}
            kiloanKg={ringkasan.kiloanKg}
            satuanPcs={ringkasan.satuanPcs}
            meteranM={ringkasan.meteranM}
          />
          <QuickActions />
        </div>
        <div className="mt-6">
          <InfoCarousel />
        </div>
      </div>
    </div>
  );
}
