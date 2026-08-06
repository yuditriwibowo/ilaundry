import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/pelanggan/table";
import { CreatePelanggan } from "@/app/ui/pelanggan/buttons";
import { lusitana } from "@/app/ui/fonts";
import { PelangganTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchPelangganPages } from "@/app/lib/data";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPelangganPages(query);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 md:static md:pb-0">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Pelanggan</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Cari Pelanggan..." />
          <CreatePelanggan />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide md:overflow-visible">
        <Suspense key={query + currentPage} fallback={<PelangganTableSkeleton />}>
          <Table query={query} currentPage={currentPage} />
        </Suspense>
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
