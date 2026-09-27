import Form from "@/app/ui/toko/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { getSessionContext, canCreateToko } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const ctx = await getSessionContext();
  if (!canCreateToko(ctx)) {
    redirect("/laundry/pengaturan/toko");
  }

  return (
    <div>
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
          <Breadcrumbs
            breadcrumbs={[
                { label: "Pengaturan Toko", href: "/laundry/pengaturan/toko" },
                {
                  label: "Tambah Toko",
                  href: "/laundry/pengaturan/toko/create",
                  active: true,
                },
              ]}
          />
         </div>
        <Form />
    </div>
  );
}
