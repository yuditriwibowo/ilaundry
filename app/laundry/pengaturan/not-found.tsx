import Link from 'next/link';
import { CogIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2 text-center p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
        <CogIcon className="h-6 w-6 text-gray-400" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Pengaturan Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-xs">
        Tekan Tombol Tambah untuk menambahkan pengaturan.
      </p>
    </main>
  );
}
