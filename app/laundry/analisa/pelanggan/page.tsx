import { Users } from "lucide-react";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import {
  fetchAnalisaPelangganPeriode,
  type AnalisaPelangganPeriode,
} from "@/app/lib/data/pelanggan";
import { formatRupiah } from "@/app/lib/utils";

/**
 * Halaman Analisa Pelanggan (ringkasan data pelanggan per periode).
 *
 * - searchParams `mulai` & `sampai` (YYYY-MM-DD) divalidasi di server:
 *   maksimal 3 bulan yang lalu, sampai >= mulai, tidak melebihi hari ini
 *   (pola sama dengan halaman Laporan Kas & Laporan Pesanan).
 * - Bagian atas: info Outlet & Periode, lalu 4 kartu statistik — Pelanggan
 *   Baru (tgl_daftar dalam periode), Total Pelanggan (seluruh pelanggan
 *   toko), Pelanggan Dengan Jumlah Pesanan Terbanyak, dan Pelanggan Dengan
 *   Nilai Pesanan Terbanyak (pesanan batal dikecualikan).
 * - Style mengikuti halaman Laporan Kas/Laporan Pesanan: fieldset project
 *   (rounded-xl border bg-white shadow-sm + legend), layout portrait satu
 *   kolom & landscape/desktop dua kolom.
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

/** Baris info: label kiri, nilai kanan (pola sama dengan Laporan Kas). */
function BarisInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

/** Kartu statistik: kotak ikon (style Fieldset "Lihat Laporan") + label kiri, nilai kanan. */
function KartuStatistik({
  label,
  sublabel,
  value,
  subvalue,
}: {
  label: string;
  sublabel?: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      {/* Kotak ikon identik dengan menu-link Analisa Pelanggan
          (app/ui/analisa-pelanggan/menu-link.tsx): rounded-lg bg-primary-100
          text-primary-700, bukan lingkaran polos lagi. */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
        <Users className="h-5 w-5" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-700">{label}</p>
          {sublabel && (
            <p className="truncate text-xs italic text-gray-500">{sublabel}</p>
          )}
        </div>
        {/* min-w-0 + wrap (tanpa truncate) agar nama panjang pindah baris,
            tidak memaksa lebar kartu melebihi layar. */}
        <div className="min-w-0 text-right">
          <p className="text-sm font-semibold leading-tight text-gray-900">
            {value}
          </p>
          {subvalue && (
            <p className="text-xs italic leading-tight text-gray-500">
              {subvalue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Page(props: {
  searchParams?: Promise<{
    mulai?: string;
    sampai?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { mulai, sampai } = resolvePeriode(
    searchParams?.mulai,
    searchParams?.sampai,
  );

  const analisa: AnalisaPelangganPeriode =
    await fetchAnalisaPelangganPeriode(mulai, sampai);

  const infoItems = [
    { label: "Outlet", value: analisa.outlet ?? "-" },
    {
      label: "Periode",
      value: `${formatTanggalIndo(mulai)} ~ ${formatTanggalIndo(sampai)}`,
    },
  ];

  // 4 kartu statistik sesuai desain (urut dari atas ke bawah).
  const kartuItems: {
    label: string;
    sublabel?: string;
    value: string;
    subvalue?: string;
  }[] = [
    { label: "Pelanggan Baru", value: `${analisa.pelangganBaru} Orang` },
    { label: "Total Pelanggan", value: `${analisa.totalPelanggan} Orang` },
    {
      label: "Pelanggan Dengan",
      sublabel: "Jumlah Pesanan Terbanyak",
      value: analisa.pelangganTerbanyakPesanan?.nama ?? "-",
      subvalue: `${analisa.pelangganTerbanyakPesanan?.jumlah ?? 0} Pesanan`,
    },
    {
      label: "Pelanggan Dengan",
      sublabel: "Nilai Pesanan Terbanyak",
      value: analisa.pelangganNilaiPesananTerbesar?.nama ?? "-",
      subvalue: formatRupiah(
        analisa.pelangganNilaiPesananTerbesar?.nilai ?? 0,
      ),
    },
  ];

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      {/* Header + breadcrumbs */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Laporan", href: "/laundry/laporan" },
            {
              label: "Analisa Pelanggan",
              href: "/laundry/analisa/pelanggan",
              active: true,
            },
          ]}
        />
      </div>

      {/* ============ Ringkasan (bagian atas) ============ */}
      {/* Langsung di dalam konten halaman (tanpa wrapper padding ekstra),
          pola sama dengan fieldset di app/laundry/laporan/page.tsx agar
          jarak kiri/kanan identik. */}
      <fieldset className="mt-4 min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Analisa Pelanggan
        </legend>

        {/* Portrait: baris info + kartu statistik (satu kolom) */}
        <div className="md:hidden landscape:hidden">
          <div className="divide-y divide-gray-100">
            {infoItems.map((item) => (
              <BarisInfo
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
            {kartuItems.map((item, i) => (
              <KartuStatistik key={i} {...item} />
            ))}
          </div>
        </div>

        {/* Landscape/desktop: 2 kolom — info, lalu kartu statistik melebar */}
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
          <div className="col-span-2 grid min-w-0 grid-cols-2 gap-4 border-t border-gray-100 pt-3">
            {kartuItems.map((item, i) => (
              <KartuStatistik key={i} {...item} />
            ))}
          </div>
        </div>
      </fieldset>
    </div>
  );
}

