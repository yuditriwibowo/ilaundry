import Form from "@/app/ui/pelanggan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export default async function Page() {
  return (
    <div>
       <div className="bg-blue-200 pb-4 px-4 pt-2 -mx-4 rounded-b-xl md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
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
       </div>
      <Form />
    </div>
  );
}
