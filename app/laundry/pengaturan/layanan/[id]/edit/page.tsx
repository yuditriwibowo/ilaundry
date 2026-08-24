import EditLayananForm from "@/app/ui/layanan/edit-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchLayananById, fetchTipeLayanan, fetchDurasiForFilter } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [layanan, optionsTipe, optionsDurasi] = await Promise.all([
    fetchLayananById(id),
    fetchTipeLayanan(),
    fetchDurasiForFilter(),
  ]);

  if (!layanan) {
    notFound();
  }

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Pengaturan Layanan", href: "/laundry/pengaturan/layanan" },
            {
              label: "Edit Layanan",
              href: `/laundry/pengaturan/layanan/${id}/edit`,
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <EditLayananForm layanan={layanan} optionsTipe={optionsTipe} optionsDurasi={optionsDurasi} />
      </div>
    </div>
  );
}
