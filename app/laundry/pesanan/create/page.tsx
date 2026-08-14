import Form from "@/app/ui/pesanan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <div>
      <div className="bg-blue-200 pb-4 px-4 pt-2 -mx-4 rounded-b-xl md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
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
      <Form customers={customers} />
    </div>
  );
}
