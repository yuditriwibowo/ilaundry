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
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[75px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0 mb-2">
        <Breadcrumbs
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
