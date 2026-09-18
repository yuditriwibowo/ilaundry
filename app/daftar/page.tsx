import Link from "next/link";
import RegisterForm from "@/app/ui/auth/register-form";

// Halaman pendaftaran akun baru (publik).
export default function Page() {
  return (
    <div className="flex h-full flex-col justify-center p-6 pt-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-lg rounded-lg bg-gray-50 px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
        <p className="mt-1 text-sm text-gray-600">
          Daftar akun sekaligus buat toko laundry pertama Anda.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/" className="font-medium text-blue-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
