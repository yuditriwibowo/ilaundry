import LaundryCard from "@/app/ui/laundry/laundrycards";
import QuickActions from "@/app/ui/laundry/quick-actions";
import AccountActiveCard from "@/app/ui/laundry/account-active-card";
import InfoCarousel from "@/app/ui/laundry/info-carousel";
import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchAccessibleToko, fetchRingkasanHariIni, fetchInfoIklanForCarousel } from "@/app/lib/data";
import { getSessionContext } from "@/app/lib/auth";
import { CreateToko } from "@/app/ui/button";
import YlaundryLogo from "@/app/ui/ylaundry-logo";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [ctx, ringkasan, stores, carouselSlides] = await Promise.all([
    getSessionContext(),
    fetchRingkasanHariIni(),
    fetchAccessibleToko(),
    fetchInfoIklanForCarousel(),
  ]);
  const selectedToko = ctx.selectedTokoId;

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
          {/* Portrait (1 kolom): kartu masa aktif di bawah LaundryCard dan di
              atas QuickActions. Landscape (md, 2 kolom): kedua kartu menyamping
              — kartu masa aktif tetap di atas QuickActions pada kolom kanan. */}
          <div className="flex flex-col gap-6 justify-between">
            <AccountActiveCard />
            <QuickActions />
          </div>
        </div>
        <div className="mt-6">
          <InfoCarousel slides={carouselSlides} />
        </div>
      </div>
    </div>
  );
}
