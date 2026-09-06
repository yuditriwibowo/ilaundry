import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchPesananById, fetchItemPesananByPesananId, fetchItemPesananPages } from "@/app/lib/data";
import { notFound } from "next/navigation";
import PesananDetailView from "@/app/ui/pesanan/detail/pesanan-detail-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Pesanan",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [pesanan, initialItems, totalPages] = await Promise.all([
    fetchPesananById(id),
    fetchItemPesananByPesananId(id, 1),
    fetchItemPesananPages(id),
  ]);

  if (!pesanan) {
    notFound();
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="portrait:bg-gradient-to-b portrait:from-primary-400 portrait:to-primary-800 portrait:px-4 portrait:-mx-4 portrait:rounded-b-xl portrait:pt-3 portrait:pb-3 portrait:min-h-[58px] portrait:flex portrait:items-center portrait:mb-2 landscape:bg-transparent landscape:px-0 landscape:mx-0 landscape:py-1.5 landscape:min-h-0 landscape:rounded-none landscape:mb-6 md:landscape:mb-3 md:bg-transparent md:px-0 md:mx-0 md:py-2 md:min-h-0 md:rounded-none md:mb-3">
        <Breadcrumbs
          className="mb-0"
          breadcrumbs={[
            { label: "Pesanan", href: "/laundry/pesanan" },
            {
              label: pesanan.nomor_pesanan ? `Detail (${pesanan.nomor_pesanan})` : "Detail Pesanan",
              href: `/laundry/pesanan/${id}/detail`,
              active: true,
            },
          ]}
        />
      </div>

      <PesananDetailView
        pesanan={pesanan}
        initialItems={initialItems}
        totalPages={totalPages}
      />
    </div>
  );
}
