import Form from "@/app/ui/kas/kas-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchLaporanKas } from "@/app/lib/data/pesanan";

export default async function Page() {
  const saldoKas = await fetchLaporanKas();

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Laporan", href: "/laundry/laporan" },
            {
              label: "Penambahan Kas",
              href: "/laundry/laporan/kas/tambah",
              active: true,
            },
          ]}
        />
      </div>
      <div className="p-4 md:p-6">
        <Form mode="tambah" saldo={saldoKas} />
      </div>
    </div>
  );
}