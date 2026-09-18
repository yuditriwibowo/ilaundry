import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/app/ui/auth/login-form";

/*
 * Halaman depan = halaman login. Layout per orientasi:
 * - Desktop (md, landscape besar)  : dua kolom, tinggi gambar dibatasi
 *   (md:max-h-[70vh]) agar konten muat tanpa scrollbar vertikal.
 * - Mobile portrait                : teks & form dipadatkan, gambar kecil
 *   (max-h-[20vh]), scrollbar disembunyikan (portrait:scrollbar-hide).
 * - Mobile landscape (short-screen): gambar disembunyikan + padding/gap
 *   dipadatkan agar semua konten muat tanpa scroll.
 * Pemusatan memakai my-auto (bukan justify-center) agar saat konten lebih
 * tinggi dari viewport, bagian ATAS tidak terpotong (auto margin = 0).
 */
export default function Page() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 pt-0 portrait:scrollbar-hide portrait-no-scrollbar short-screen:p-4 short-screen:pt-0">
      <div className="my-auto mt-4 flex w-full flex-col gap-4 md:flex-row short-screen:mt-0 short-screen:gap-2">
        <div className="flex flex-col justify-center gap-4 rounded-lg bg-gray-50 px-6 py-6 md:w-2/5 md:gap-6 md:px-20 md:py-10 short-screen:gap-2 short-screen:px-3 short-screen:py-2">
          <p className="text-base leading-snug text-gray-800 short-screen:text-sm md:text-3xl md:leading-normal">
            Selamat datang di <strong>yLaundry</strong>. Aplikasi Laundry{" "}
            <strong>terbaik</strong>.
          </p>

          <LoginForm />

          <Link
            href="/daftar"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 text-sm font-bold transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>Buat Akun Baru</span>
          </Link>
        </div>

        <div className="flex items-center justify-center p-4 md:w-3/5 md:px-28 md:py-12 short-screen:hidden">
          <Image
            src="/ylaundry-desktop.png"
            alt="yLaundry image desktop version"
            width={1000}
            height={760}
            className="hidden md:block md:max-h-[70vh] md:w-auto"
            loading="eager"
          />
          <Image
            src="/ylaundry-mobile.png"
            alt="yLaundry image mobile version"
            width={560}
            height={620}
            className="block max-h-[20vh] w-auto md:hidden"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}


