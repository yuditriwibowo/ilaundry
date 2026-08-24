import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/layanan/table";
import LayananFilters from "@/app/ui/layanan/filters";
import { CreateLayanan } from "@/app/ui/layanan/buttons";
import { fetchLayananPages, fetchTipeLayanan, fetchDurasiForFilter } from "@/app/lib/data";
import { Suspense } from "react";
import { DurasiTableSkeleton } from "@/app/ui/skeletons";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    tipe?: string;
    durasi?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const tipe = searchParams?.tipe || "";
  const durasi = searchParams?.durasi || "";
  
  const totalPages = await fetchLayananPages(query, tipe, durasi);
  const optionsTipe = await fetchTipeLayanan();
  const optionsDurasi = await fetchDurasiForFilter();
  
  return (
      <div className="flex h-full w-full flex-col -mt-2">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-400 to-primary-800 pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
          <div className="flex w-full items-center justify-between">
               <h1 className={`text-2xl text-white md:text-black`}>Pengaturan Layanan</h1>
            </div>
<div className="mt-4 flex items-center justify-between gap-2 md:mt-6 short-screen:mt-2">
               <Search placeholder="Cari Layanan..." />
               <CreateLayanan />
             </div>
             <div className="mt-2 flex items-center gap-2">
               <LayananFilters optionsTipe={optionsTipe} optionsDurasi={optionsDurasi} />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <Suspense key={query + currentPage + tipe + durasi} fallback={<DurasiTableSkeleton />}>
              <Table query={query} currentPage={currentPage} tipeId={tipe} durasiNama={durasi} />
            </Suspense>
            <div className="mt-5 hidden w-full justify-center md:flex short-screen:mt-3">
              <Pagination totalPages={totalPages} />
            </div>
          </div>
        </div>
    );
}
