import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import { getSessionContext, canManageAppAdmin } from "@/app/lib/auth";
import MenuLink from "@/app/ui/pengaturan/menu-link";

export const metadata: Metadata = {
  title: "App Admin",
};

export default async function Page() {
  // Guard: HANYA Administrator. Menu disembunyikan untuk role lain,
  // dan akses URL langsung oleh non-Administrator tetap ditolak.
  const ctx = await getSessionContext();
  if (!canManageAppAdmin(ctx.peran)) {
    redirect("/laundry/pengaturan");
  }

  return (
    <div className="flex h-full w-full flex-col -mt-2">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md pb-6 px-4 pt-6 -mx-4 rounded-b-xl md:static md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl text-white md:text-gray-900">App Admin</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 portrait:scrollbar-hide portrait-no-scrollbar">
        {/* Fieldset Menu App Admin */}
        <fieldset className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Menu App Admin
          </legend>
          <div className="divide-y divide-gray-100">
            <MenuLink
              icon={Megaphone}
              title="Pengaturan Info & Iklan"
              description="Kelola info dan iklan global (Administrator)"
              href="/laundry/pengaturan/app-admin/info-iklan"
            />
          </div>
        </fieldset>
      </div>
    </div>
  );
}
