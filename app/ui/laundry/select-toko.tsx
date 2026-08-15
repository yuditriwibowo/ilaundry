import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function SelectToko({ stores }: { stores: any[] }) {
  return (
    <div className="relative w-full max-w-xs">
      <select className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 bg-white text-black">
        <option value="">Pilih Toko</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.nama_toko}
          </option>
        ))}
      </select>
      <BuildingStorefrontIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
    </div>
  );
}
