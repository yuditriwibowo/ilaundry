import Form from "@/app/ui/pelanggan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Pelanggan", href: "/dashboard/pelanggan" },
          {
            label: "Tambah Pelanggan",
            href: "/dashboard/pelanggan/create",
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
