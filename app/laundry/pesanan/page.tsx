import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/pesanan/table";
import PesananFilters from "@/app/ui/pesanan/filters";
import { CreatePesanan } from "@/app/ui/pesanan/buttons";
import { fetchPesananPages } from "@/app/lib/data";
import { Suspense } from "react";
import { PesananTableSkeleton } from "@/app/ui/skeletons";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    bayar?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const status = searchParams?.status || "";
  const bayar = searchParams?.bayar || "";

  const totalPages = await fetchPesananPages(query, status, bayar);

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary-400 to-primary-800 pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none short-screen:pb-3 short-screen:pt-3">
        <div className="flex w-full items-center justify-between">
          <h1 className={`text-2xl text-white md:text-gray-900`}>Pesanan</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-6 short-screen:mt-2">
          <Search placeholder="Cari Pesanan..." />
          <CreatePesanan />
        </div>
        <div className="mt-2 flex w-full items-center gap-2 short-screen:mt-1">
          <PesananFilters />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <Suspense key={query + currentPage + status + bayar} fallback={<PesananTableSkeleton />}>
          <Table query={query} currentPage={currentPage} status={status} bayar={bayar} />
        </Suspense>
        <div className="mt-5 hidden w-full justify-center md:flex short-screen:mt-3">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

