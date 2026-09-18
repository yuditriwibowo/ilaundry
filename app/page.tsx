import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/app/ui/auth/login-form";
import YlaundryLogo from "@/app/ui/ylaundry-logo";

// Halaman depan = halaman login (dilindungi proxy untuk rute /laundry/*).
// Bila user sudah login tetap boleh melihat form (login ulang / ganti toko).
export default function Page() {
  return (
    <div className="flex h-full flex-col justify-center p-6 pt-0 overflow-y-auto">
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className="block md:hidden">
            <YlaundryLogo />
          </div>
          <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
            Selamat datang di <strong>yLaundry</strong>. Aplikasi Laundry{" "}
            <strong>terbaik</strong>.
          </p>

          <LoginForm />

          <Link
            href="/daftar"
            className="flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-gray-50 text-blue-600 md:border-transparent md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:text-white px-4 text-sm font-bold transition-all hover:bg-blue-50 md:hover:from-blue-700 md:hover:to-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>Buat Akun Baru</span>
          </Link>
        </div>

        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <Image
            src="/ylaundry-desktop.png"
            alt="yLaundry image desktop version"
            width={1000}
            height={760}
            className="hidden md:block"
            loading="eager"
          />
          <Image
            src="/ylaundry-mobile.png"
            alt="yLaundry image mobile version"
            width={560}
            height={620}
            className="block md:hidden"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

