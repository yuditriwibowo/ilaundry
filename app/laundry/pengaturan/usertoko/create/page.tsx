import Form from "@/app/ui/usertoko/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export default async function Page() {
  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "User Toko", href: "/laundry/pengaturan/usertoko" },
            {
              label: "Tambah User Toko",
              href: "/laundry/pengaturan/usertoko/create",
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <Form />
      </div>
    </div>
  );
}
