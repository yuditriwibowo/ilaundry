import LaundryCard from "@/app/ui/laundry/laundrycards";
import QuickActions from "@/app/ui/laundry/quick-actions";
import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchToko } from "@/app/lib/data";
import { CreateToko } from "@/app/ui/button";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stores = await fetchToko();
  const cookieStore = await cookies();
  const selectedToko = cookieStore.get("selected_toko")?.value || "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-4">
        <SelectToko stores={stores} selectedToko={selectedToko} />
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
        <QuickActions />
      </div>
    </div>
  );
}
