import RegisterForm from "@/app/ui/auth/register-form";
import YlaundryLogo from "@/app/ui/ylaundry-logo";

/*
 * Halaman pendaftaran akun baru (publik).
 * - Header biru (gradient sama dengan halaman login) selalu terlihat:
 *   di mobile dirender di sini (header global disembunyikan untuk rute
 *   ini), di desktop memakai header global jadi tidak dirender ulang.
 * - Pemusatan kartu memakai my-auto (bukan justify-center) agar saat
 *   konten lebih tinggi dari viewport (PWA mobile portrait), bagian
 *   ATAS form tidak terpotong dan tetap bisa di-scroll.
 */
export default function Page() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header biru sticky (mobile) — desktop memakai header global */}
      <div className="flex-none bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-4 pt-3 pb-4 shadow-md rounded-b-xl md:hidden short-screen:pt-1 short-screen:pb-2">
        <YlaundryLogo />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pt-0 portrait:scrollbar-hide portrait-no-scrollbar">
        <div className="my-auto mx-auto w-full max-w-lg rounded-lg bg-gray-50 px-6 py-10 md:max-w-4xl md:px-10">
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="mt-1 text-sm text-gray-600">
            Daftar akun sekaligus buat toko laundry pertama Anda.
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}

