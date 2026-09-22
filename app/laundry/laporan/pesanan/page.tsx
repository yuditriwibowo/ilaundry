import Breadcrumbs from "@/app/ui/breadcrumbs";
import Pagination from "@/app/ui/pagination";
import {
  fetchLaporanPesananPeriode,
  fetchFilteredPesananLaporan,
  fetchLaporanPesananPages,
} from "@/app/lib/data/pesanan";
import LaporanPesananInfiniteList from "@/app/ui/laporan-pesanan/infinite-list";
import LaporanPesananTable from "@/app/ui/laporan-pesanan/table";
import { formatRupiah } from "@/app/lib/utils";

/**
 * Halaman Laporan Pesanan (data pesanan per periode).
 *
 * - searchParams `mulai` & `sampai` (YYYY-MM-DD) divalidasi di server:
 *   maksimal 3 bulan yang lalu, sampai >= mulai, tidak melebihi hari ini
 *   (pola sama dengan halaman Laporan Kas).
 * - searchParams `page` (opsional) untuk pagination tabel desktop; di-clamp
 *   ke rentang 1..totalPages.
 * - Bagian atas: ringkasan sesuai desain — info Outlet & Periode, lalu
 *   kelompok Jumlah/Nilai Pesanan (+ rincian Sudah/Belum Bayar), Pesanan
 *   Batal, Total Antar-Jemput/Diskon, dan Total Kiloan/Satuan/Meteran.
 * - Bagian bawah: daftar pesanan sesuai rentang tgl_pesanan & toko
 *   terpilih — tabel (read-only) di landscape/desktop, infinite list di
 *   mobile portrait (mengikuti pola daftar menu Pesanan).
 */

// Rentang default & maksimum: 3 bulan terakhir (sama dengan Laporan Kas).
function defaultPeriode() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    mulai: iso(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())),
    sampai: iso(now),
  };
}

// Validasi & clamp input user (defensive, sinkron dengan batas popup):
// format YYYY-MM-DD, sampai >= mulai, mulai >= 3 bulan lalu, sampai <= hari ini.
function resolvePeriode(mulai?: string, sampai?: string) {
  const { mulai: defMulai, sampai: defSampai } = defaultPeriode();
  const re = /^\d{4}-\d{2}-\d{2}$/;
  let m = mulai && re.test(mulai) ? mulai : defMulai;
  let s = sampai && re.test(sampai) ? sampai : defSampai;
  if (s < m) [m, s] = [s, m]; // tukar jika terbalik
  const min = defMulai; // 3 bulan yang lalu
  const max = defSampai; // hari ini
  if (m < min) m = min;
  if (s < min) s = min;
  if (s > max) s = max;
  if (m > s) m = s;
  return { mulai: m, sampai: s };
}

// "22 Sep 2026" untuk tampilan periode.
function formatTanggalIndo(tgl: string): string {
  const [y, m, d] = tgl.split("-").map(Number);
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${String(d).padStart(2, "0")} ${bulan[m - 1]} ${y}`;
}

/** Format jumlah volume: 2 desimal untuk kg/m, tanpa nol buangan untuk pcs. */
function formatJumlah(n: number, mode: "desimal" | "utuh"): string {
  if (mode === "desimal") return n.toFixed(2);
  return String(parseFloat(n.toFixed(2)));
}

/** Satu baris ringkasan: label kiri, nilai kanan. */
function BarisRingkasan({
  label,
  value,
  valueClassName = "font-medium text-gray-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`whitespace-nowrap text-sm ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

/** Baris rincian (indent): "Sudah Bayar :  Rp x". */
function BarisRincian({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-4">
      <span className="whitespace-nowrap text-xs text-gray-500">
        {label} :
      </span>
      <span className="whitespace-nowrap text-xs font-medium text-gray-500">
        {value}
      </span>
    </div>
  );
}

export default async function Page(props: {
  searchParams?: Promise<{
    mulai?: string;
    sampai?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { mulai, sampai } = resolvePeriode(
    searchParams?.mulai,
    searchParams?.sampai,
  );

  const laporan = await fetchLaporanPesananPeriode(mulai, sampai);
  const totalPages = await fetchLaporanPesananPages(mulai, sampai);
  // Halaman tabel desktop (di-clamp ke rentang valid, defensive).
  const currentPage = Math.min(
    Math.max(Number(searchParams?.page) || 1, 1),
    Math.max(totalPages, 1),
  );
  const pesananList = await fetchFilteredPesananLaporan(
    mulai,
    sampai,
    currentPage,
  );

  const infoItems = [
    { label: "Outlet", value: laporan.outlet ?? "-" },
    {
      label: "Periode",
      value: `${formatTanggalIndo(mulai)} ~ ${formatTanggalIndo(sampai)}`,
    },
  ];

  // Kelompok baris ringkasan (urut sesuai desain):
  // 1) Jumlah & Nilai Pesanan (+ rincian bayar)
  // 2) Pesanan batal
  // 3) Antar-jemput & diskon
  // 4) Volume per satuan (kiloan / satuan / meteran)
  const groups: {
    label: string;
    value: string;
    valueClassName?: string;
    rincian?: { label: string; value: string }[];
  }[][] = [
    [
      {
        label: "Jumlah Pesanan",
        value: `${laporan.jumlahPesanan} Pesanan`,
      },
      {
        label: "Nilai Pesanan",
        value: formatRupiah(laporan.nilaiPesanan),
        rincian: [
          { label: "Sudah Bayar", value: formatRupiah(laporan.sudahBayar) },
          { label: "Belum Bayar", value: formatRupiah(laporan.belumBayar) },
        ],
      },
    ],
    [
      {
        label: "Pesanan Batal",
        value: `${laporan.pesananBatal} Pesanan`,
        valueClassName:
          laporan.pesananBatal > 0
            ? "font-medium text-red-600"
            : "font-medium text-gray-900",
      },
      {
        label: "Nilai Pesanan Batal",
        value: formatRupiah(laporan.nilaiPesananBatal),
        valueClassName:
          laporan.nilaiPesananBatal > 0
            ? "font-medium text-red-600"
            : "font-medium text-gray-900",
      },
    ],
    [
      {
        label: "Total Antar-Jemput",
        value: formatRupiah(laporan.totalAntarJemput),
      },
      { label: "Total Diskon", value: formatRupiah(laporan.totalDiskon) },
    ],
    [
      {
        label: "Total Kiloan",
        value: `${formatJumlah(laporan.totalKiloan, "desimal")} kg`,
      },
      {
        label: "Total Satuan",
        value: `${formatJumlah(laporan.totalSatuan, "utuh")} pcs`,
      },
      {
        label: "Total Meteran",
        value: `${formatJumlah(laporan.totalMeteran, "desimal")} m`,
      },
    ],
  ];

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      {/* Header + breadcrumbs */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Laporan", href: "/laundry/laporan" },
            {
              label: "Laporan Pesanan",
              href: "/laundry/laporan/pesanan",
              active: true,
            },
          ]}
        />
      </div>

      <div className="p-4 md:p-6">
        {/* ============ Ringkasan (bagian atas) ============ */}
        <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Ringkasan Pesanan
          </legend>

          {/* Portrait: baris info + kelompok ringkasan (satu kolom) */}
          <div className="md:hidden landscape:hidden">
            <div className="divide-y divide-gray-100">
              {infoItems.map((item) => (
                <BarisRingkasan
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  valueClassName="font-semibold text-gray-900"
                />
              ))}
            </div>
            {groups.map((group, gi) => (
              <div
                key={gi}
                className={
                  gi === 0 ? "mt-3 border-t border-gray-100 pt-2" : "mt-4"
                }
              >
                {group.map((baris) => (
                  <div key={baris.label}>
                    <BarisRingkasan
                      label={baris.label}
                      value={baris.value}
                      valueClassName={baris.valueClassName}
                    />
                    {baris.rincian?.map((r) => (
                      <BarisRincian
                        key={r.label}
                        label={r.label}
                        value={r.value}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Landscape/desktop: 2 kolom — info, lalu kelompok ringkasan */}
          <div className="hidden md:grid landscape:grid grid-cols-2 gap-x-8 gap-y-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
            {groups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {group.map((baris) => (
                  <div key={baris.label}>
                    <BarisRingkasan
                      label={baris.label}
                      value={baris.value}
                      valueClassName={baris.valueClassName}
                    />
                    {baris.rincian?.map((r) => (
                      <BarisRincian
                        key={r.label}
                        label={r.label}
                        value={r.value}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </fieldset>

        {/* ============ Daftar pesanan (bagian bawah) ============ */}
        <div className="mt-6 flow-root">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Portrait: infinite list */}
            <div className="md:hidden landscape:hidden">
              <LaporanPesananInfiniteList
                key={`${mulai}-${sampai}`}
                initialPesanan={pesananList}
                mulai={mulai}
                sampai={sampai}
                totalPages={totalPages}
              />
            </div>
            {/* Landscape / desktop: tabel read-only */}
            <LaporanPesananTable pesananList={pesananList} />
          </div>
        </div>
        <div className="mt-5 hidden w-full justify-center md:flex short-screen:mt-3">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}