import Breadcrumbs from "@/app/ui/breadcrumbs";
import ItemPesananForm from "@/app/ui/pesanan/item-pesanan-form";
import {
  fetchPesananById,
  fetchLayananForForm,
  fetchParfumForForm,
  fetchDiskonForForm,
} from "@/app/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Item Pesanan",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [pesanan, optionsLayanan, optionsParfum, optionsDiskon] =
    await Promise.all([
      fetchPesananById(id),
      fetchLayananForForm(),
      fetchParfumForForm(),
      fetchDiskonForForm(),
    ]);

  if (!pesanan) {
    notFound();
  }

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Pesanan", href: "/laundry/pesanan" },
            {
              label: pesanan.nomor_pesanan
                ? `Detail (${pesanan.nomor_pesanan})`
                : "Detail Pesanan",
              href: `/laundry/pesanan/${id}/detail`,
            },
            {
              label: "Tambah Item",
              href: `/laundry/pesanan/${id}/item/create`,
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <ItemPesananForm
          pesanan={pesanan}
          optionsLayanan={optionsLayanan}
          optionsParfum={optionsParfum}
          optionsDiskon={optionsDiskon}
        />
      </div>
    </div>
  );
}