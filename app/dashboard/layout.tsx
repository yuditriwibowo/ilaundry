import SideNav from '@/app/ui/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    /* h-full memastikan layout dashboard mengisi seluruh sisa ruang dari RootLayout */
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      <div className="hidden md:block w-full flex-none md:w-64">
        <SideNav />
      </div>
      
      {/* grow membuat konten mengisi ruang tengah, p-6 memberi jarak agar tidak tertutup navigasi bawah */}
      <div className="grow p-6 overflow-y-auto md:p-12 pb-24 md:pb-12">
        {children}
      </div>
      
      {/* Navigasi mobile: diletakkan di akhir flex-col sehingga otomatis berada di paling bawah layar */}
      <div className="w-full flex-none md:hidden">
        <SideNav />
      </div>
    </div>
  );
}