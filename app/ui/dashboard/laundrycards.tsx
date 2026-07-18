import { Shirt } from 'lucide-react'; // Menggunakan ikon baju yang sama dengan logo [source: 2]
import { lusitana } from "@/app/ui/fonts";
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface LaundryCardProps {
  totalRp?: number;
  totalPesanan?: number;
  kiloanKg?: number;
  satuanPcs?: number;
  meteranM?: number;
}

export default function LaundryCard({
  totalRp = 0,
  totalPesanan = 0,
  kiloanKg = 0,
  satuanPcs = 0,
  meteranM = 0,
}: LaundryCardProps) {
  return (
    <div className="w-full">
      
      
    {/*Mengubah background menjadi biru (bg-blue-600) dan teks menjadi putih (text-white) agar kontras */}
    <div className="w-full rounded-xl bg-blue-600 p-5 text-white shadow-md font-sans">
      {/* Bagian Atas / Header Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Ikon baju disesuaikan dengan tema ilaundry-logo [source: 2] */}
          <DocumentDuplicateIcon className="h-10 w-10 text-white opacity-90" />
          <div>
            <h3 className="text-base font-medium leading-tight text-white">Pesanan</h3>
            <p className="text-sm text-blue-100 italic">Hari Ini</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-white">
            Rp {totalRp.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-blue-100 italic">{totalPesanan} Pesanan</p>
        </div>
      </div>

      {/* Garis Pembatas Horisontal */}
      <hr className="border-white/30 my-4" />

      {/* Bagian Bawah / Detail Metrik */}
      <div className="grid grid-cols-3 text-center mt-2">
        {/* Kiloan */}
        <div>
          <p className="text-3xl font-bold text-white">
            {kiloanKg} <span className="text-base font-normal">kg</span>
          </p>
          <p className="text-sm text-blue-100 italic mt-1">Kiloan</p>
        </div>

        {/* Satuan */}
        <div className="border-x border-blue-400/30">
          <p className="text-3xl font-bold text-white">
            {satuanPcs} <span className="text-base font-normal">pcs</span>
          </p>
          <p className="text-sm text-blue-100 italic mt-1">Satuan</p>
        </div>

        {/* Meteran */}
        <div>
          <p className="text-3xl font-bold text-white">
            {meteranM} <span className="text-base font-normal">m</span>
          </p>
          <p className="text-sm text-blue-100 italic mt-1">Meteran</p>
        </div>
      </div>
    </div>
    </div>
  );
}