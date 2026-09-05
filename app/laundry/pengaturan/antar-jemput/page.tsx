import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/antar-jemput/table";
import { CreateAntarJemput } from "@/app/ui/antar-jemput/buttons";
import { AntarJemputTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchAntarJemputPages } from "@/app/lib/data";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchAntarJemputPages(query);

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-400 to-primary-800 pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
        <div className="flex w-full items-center justify-between">
          <h1 className={`text-2xl text-white md:text-gray-900`}>Pengaturan Antar-Jemput</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-6 short-screen:mt-2">
          <Search placeholder="Cari Antar-Jemput..." />
          <CreateAntarJemput />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <Suspense key={query + currentPage} fallback={<AntarJemputTableSkeleton />}>
          <Table query={query} currentPage={currentPage} />
        </Suspense>
        <div className="mt-5 hidden w-full justify-center md:flex short-screen:mt-3">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
