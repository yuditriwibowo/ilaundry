import LaundryCard from "@/app/ui/laundry/laundrycards";
import QuickActions from "@/app/ui/laundry/quick-actions";
import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchToko } from "@/app/lib/data";
import { CreateToko } from "@/app/ui/button";
import { cookies } from "next/headers";
import YlaundryLogo from "@/app/ui/ylaundry-logo";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stores = await fetchToko();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || "";

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-400 to-primary-800 pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
        <div className="flex flex-col md:flex-row w-full items-start md:items-center gap-4 md:gap-0">
  <div className="w-full">
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
            totalRp={1285000}
            totalPesanan={23}
            kiloanKg={116}
            satuanPcs={12}
            meteranM={20}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
