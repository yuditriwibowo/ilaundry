import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="flex grow flex-row justify-between items-center space-x-2 md:flex-col md:space-x-0 md:space-y-2 md:items-start">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form className="w-full">
          <button className="flex h-auto w-full flex-col items-center justify-center gap-1 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-row md:h-11 md:w-full md:justify-start md:gap-2 md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="block text-[10px] md:text-sm">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
