import Form from "@/app/ui/pesanan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <div>
       <div className="bg-primary-100 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
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
