import EditForm from "@/app/ui/pesanan/edit-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import {
  fetchPesananById,
  fetchAllItemPesananByPesananId,
  fetchPelangganForForm,
  fetchLayananForForm,
  fetchParfumForForm,
  fetchDiskonForForm,
  fetchAntarJemputForForm,
} from "@/app/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Pesanan",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [
    pesanan,
    initialItems,
    optionsPelanggan,
    optionsLayanan,
    optionsParfum,
    optionsDiskon,
    optionsAntarJemput,
  ] = await Promise.all([
    fetchPesananById(id),
    fetchAllItemPesananByPesananId(id),
    fetchPelangganForForm(),
    fetchLayananForForm(),
    fetchParfumForForm(),
    fetchDiskonForForm(),
    fetchAntarJemputForForm(),
  ]);

  if (!pesanan) {
    notFound();
  }

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Pesanan", href: "/laundry/pesanan" },
            {
              label: pesanan.nomor_pesanan
                ? `Edit (${pesanan.nomor_pesanan})`
                : "Edit Pesanan",
              href: `/laundry/pesanan/${id}/edit`,
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <EditForm
          pesanan={pesanan}
          initialItems={initialItems}
          optionsPelanggan={optionsPelanggan}
          optionsLayanan={optionsLayanan}
          optionsParfum={optionsParfum}
          optionsDiskon={optionsDiskon}
          optionsAntarJemput={optionsAntarJemput}
        />
      </div>
    </div>
  );
}