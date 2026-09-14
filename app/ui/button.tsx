import clsx from 'clsx';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-bold text-white transition-all hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CreateToko() {
  return (
    <Link
      href="/laundry/pengaturan/toko/create"
      className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 text-blue-600 md:border-transparent md:bg-gradient-to-r md:from-blue-600 md:to-indigo-600 md:text-white px-4 text-sm font-bold whitespace-nowrap transition-all hover:bg-blue-50 md:hover:from-blue-700 md:hover:to-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Tambah Toko</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}
