import Form from "@/app/ui/pesanan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import {
  fetchPelangganForForm,
  fetchLayananForForm,
  fetchParfumForForm,
  fetchDiskonForForm,
  fetchAntarJemputForForm,
} from "@/app/lib/data";

export default async function Page() {
  const [optionsPelanggan, optionsLayanan, optionsParfum, optionsDiskon, optionsAntarJemput] =
    await Promise.all([
      fetchPelangganForForm(),
      fetchLayananForForm(),
      fetchParfumForForm(),
      fetchDiskonForForm(),
      fetchAntarJemputForForm(),
    ]);

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Pesanan", href: "/laundry/pesanan" },
            {
              label: "Tambah Pesanan",
              href: "/laundry/pesanan/create",
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <Form
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
