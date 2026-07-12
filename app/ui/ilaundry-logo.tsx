import { Shirt } from 'lucide-react'; // Import ikon baju
import { lusitana } from '@/app/ui/fonts';

export default function IlaundryLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      {/* Ikon baju dari Lucide */}
      <Shirt className="h-12 w-12 rotate-[-15deg]" /> 
      <p className="text-[44px]">iLaundry</p>
    </div>
  );
}