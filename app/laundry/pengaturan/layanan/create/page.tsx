import Form from "@/app/ui/layanan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchTipeLayanan, fetchDurasiForFilter } from "@/app/lib/data";

export default async function Page() {
  const [optionsTipe, optionsDurasi] = await Promise.all([
    fetchTipeLayanan(),
    fetchDurasiForFilter(),
  ]);

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Layanan", href: "/laundry/pengaturan/layanan" },
            {
              label: "Tambah Layanan",
              href: "/laundry/pengaturan/layanan/create",
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <Form optionsTipe={optionsTipe} optionsDurasi={optionsDurasi} />
      </div>
    </div>
  );
}
