import { lusitana } from "@/app/ui/fonts";
import SelectToko from "@/app/ui/laundry/select-toko";
import { fetchToko } from "@/app/lib/data";

export default async function Page() {
    const stores = await fetchToko();
    return (
        <div className="flex h-full w-full flex-col -mt-2">
            <div className="sticky top-0 z-10 bg-primary-100 pb-4 px-4 pt-2 -mx-4 rounded-b-xl md:static md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
                <div className="flex w-full items-center justify-between">
                        <h1 className={`${lusitana.className} text-2xl`}>Pengaturan</h1>
                        <SelectToko stores={stores} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide md:overflow-visible">
                <div></div>
            </div>
        </div>
    );
}