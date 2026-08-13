import SideNav from "@/app/ui/laundry/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    /* h-full memastikan layout dashboard mengisi seluruh sisa ruang dari RootLayout */
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      <div className="hidden md:block w-full flex-none md:w-40">
        <SideNav />
      </div>

      {/* pb-20 memberi ruang agar konten tidak tertutup navigasi bawah (fixed) */}
      {/* pb-20 memberi ruang agar konten tidak tertutup navigasi bawah (fixed) */}
      <div className="grow px-4 pt-0 overflow-y-auto md:px-4 md:pt-4 pb-20 md:pb-12">
        {children}
      </div>

      {/* Navigasi mobile: fixed agar posisi konsisten di PWA portrait */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <SideNav />
      </div>
    </div>
  );
}
