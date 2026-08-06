import Form from "@/app/ui/pesanan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <div>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Pesanan", href: "/dashboard/pesanan" },
          {
            label: "Tambah Pesanan",
            href: "/dashboard/pesanan/create",
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </div>
  );
}
