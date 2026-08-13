import Form from "@/app/ui/pelanggan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export default async function Page() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbs={[
           { label: "Pelanggan", href: "/laundry/pelanggan" },
           {
             label: "Tambah Pelanggan",
             href: "/laundry/pelanggan/create",
            active: true,
          },
        ]}
      />
      <Form />
    </div>
  );
}
