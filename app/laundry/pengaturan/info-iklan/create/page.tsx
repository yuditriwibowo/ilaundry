import Form from "@/app/ui/info-iklan/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionContext, canManageInfoIklan } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Tambah Info & Iklan",
};

export default async function Page() {
  // Guard: HANYA Administrator.
  const ctx = await getSessionContext();
  if (!canManageInfoIklan(ctx.peran)) {
    redirect("/laundry/pengaturan");
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Pengaturan Info & Iklan", href: "/laundry/pengaturan/info-iklan" },
            {
              label: "Tambah Info & Iklan",
              href: "/laundry/pengaturan/info-iklan/create",
              active: true,
            },
          ]}
        />
      </div>
      <Form />
    </div>
  );
}