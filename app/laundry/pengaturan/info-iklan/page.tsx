import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/info-iklan/table";
import { CreateInfoIklan } from "@/app/ui/info-iklan/buttons";
import { InfoIklanTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchInfoIklanPages } from "@/app/lib/data";
import { getSessionContext, canManageInfoIklan } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Pengaturan Info & Iklan",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  // Guard: HANYA Administrator. Menu disembunyikan untuk role lain,
  // dan akses URL langsung oleh non-Administrator tetap ditolak.
  const ctx = await getSessionContext();
  if (!canManageInfoIklan(ctx.peran)) {
    redirect("/laundry/pengaturan");
  }

  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInfoIklanPages(query);

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
        <div className="flex w-full items-center justify-between">
          <h1 className={`text-2xl text-white md:text-gray-900`}>
            Pengaturan Info & Iklan
          </h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-6 short-screen:mt-2">
          <Search placeholder="Cari Info/Iklan..." />
          <CreateInfoIklan />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 portrait:scrollbar-hide portrait-no-scrollbar">
        <Suspense key={query + currentPage} fallback={<InfoIklanTableSkeleton />}>
          <Table query={query} currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
        <div className="mt-5 hidden w-full justify-center md:flex short-screen:mt-3">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}