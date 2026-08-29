import Form from "@/app/ui/diskon/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export default async function Page() {
  return (
    <div>
        <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
          <Breadcrumbs
            breadcrumbs={[
                { label: "Pengaturan Diskon", href: "/laundry/pengaturan/diskon" },
                {
                  label: "Tambah Diskon",
                  href: "/laundry/pengaturan/diskon/create",
                  active: true,
                },
              ]}
          />
          </div>
        <Form />
    </div>
  );
}
