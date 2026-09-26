import { ClockPlus } from "lucide-react";

// Kartu "Masa Aktif Akun" di halaman overview (app/laundry/(overview)/page.tsx).
// Seluruh data masih di-hardcode — implementasi dinamis (fetch masa aktif akun
// dan aksi perpanjangan) akan ditambahkan di masa berikutnya.
//
// Warna & font mengikuti konvensi project:
// - bg-white + palet gray berbasis CSS variable otomatis menyesuaikan mode
//   gelap (lihat app/ui/global.css dan tailwind.config.ts).
// - Tombol memakai gradient biru yang sama dengan tombol primary
//   (app/ui/button.tsx) — aman untuk mode terang maupun gelap.

export default function AccountActiveCard() {
  return (
    <div className="w-full">
      <div className="w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-5 font-sans flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm md:text-base font-medium text-gray-500 leading-tight">
            Masa Aktif Akun
          </p>
          <p className="text-base md:text-lg font-bold text-gray-900 mt-1">
            25/08/2027
          </p>
        </div>
        {/* TODO: aksi perpanjangan belum diimplementasikan — tombol masih
            hardcoded, akan diimplementasikan di masa berikutnya. */}
        <button
          type="button"
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98]"
        >
          <ClockPlus className="h-5 w-5" aria-hidden="true" />
          Perpanjang
        </button>
      </div>
    </div>
  );
}
