import { Users } from "lucide-react";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import {
  fetchAnalisaLayananPeriode,
  resolveUrutanLayanan,
  type AnalisaLayananPeriode,
} from "@/app/lib/data/layanan";
import { formatRupiah } from "@/app/lib/utils";
import UrutkanSelect from "@/app/ui/analisa-layanan/urutkan-select";

/**
 * Halaman Analisa Layanan (peringkat layanan per periode).
 *
 * - searchParams `mulai` & `sampai` (YYYY-MM-DD) divalidasi di server:
 *   maksimal 3 bulan yang lalu, sampai >= mulai, tidak melebihi hari ini
 *   (pola sama dengan halaman Analisa Pelanggan). searchParams `urutkan`
 *   divalidasi whitelist kunci opsi urutan (default "nilai-tertinggi").
 * - Bagian atas: info Outlet & Periode, jumlah Jenis Durasi & Jenis Layanan
 *   (katalog layanan toko), dan baris "Urutkan" (dropdown popup).
 * - Bagian bawah: peringkat layanan yang terjual dalam periode — nomor
 *   urut, durasi - tipe layanan, nama layanan; kanan: nilai (Rp) dan
 *   kuantitas (kg / pcs / m). Pesanan & item batal dikecualikan.
 * - Style mengikuti halaman Analisa Pelanggan: fieldset project (rounded-xl
 *   border bg-white shadow-sm + legend), layout portrait satu kolom &
 *   landscape/desktop dua kolom.
 */

// Rentang default & maksimum: 3 bulan terakhir (sama dengan Analisa Pelanggan).
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

// "54.94" / "1" untuk tampilan kuantitas (maks 2 desimal, pemisah titik
// sesuai desain: "54.94 kg", "1 pcs").
function formatKuantitas(kuantitas: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(kuantitas);
}

/** Baris info: label kiri, nilai kanan (pola sama dengan Analisa Pelanggan). */
function BarisInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

/**
 * Baris peringkat: nomor urut, "Durasi - Tipe" (italic), nama layanan;
 * kanan: label "Nilai & Kuantitas", nilai (Rp), kuantitas + satuan.
 *
 * `className` dipakai untuk pembatas antar baris per layout (portrait pakai
 * divide-y di container; landscape pakai border-b di tiap baris).
 */
function BarisPeringkat({
  nomor,
  namaLayanan,
  kategori,
  nilai,
  kuantitas,
  satuan,
  className = "",
}: {
  nomor: number;
  namaLayanan: string;
  kategori: string;
  nilai: number;
  kuantitas: number;
  satuan: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 py-3 ${className}`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-900">#{nomor}</p>
        <p className="text-xs italic text-gray-500">{kategori}</p>
        {/* min-w-0 + wrap (tanpa truncate) agar nama panjang pindah baris,
            tidak memaksa lebar baris melebihi layar. */}
        <p className="min-w-0 text-sm font-semibold text-gray-900">
          {namaLayanan}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs italic text-gray-500">Nilai &amp; Kuantitas</p>
        <p className="text-sm font-semibold text-gray-900">
          {formatRupiah(nilai)}
        </p>
        <p className="text-xs italic text-gray-500">
          {formatKuantitas(kuantitas)} {satuan}
        </p>
      </div>
    </div>
  );
}

export default async function Page(props: {
  searchParams?: Promise<{
    mulai?: string;
    sampai?: string;
    urutkan?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { mulai, sampai } = resolvePeriode(
    searchParams?.mulai,
    searchParams?.sampai,
  );
  const urutkan = resolveUrutanLayanan(searchParams?.urutkan);

  const analisa: AnalisaLayananPeriode =
    await fetchAnalisaLayananPeriode(mulai, sampai, urutkan);

  const infoItems = [
    { label: "Outlet", value: analisa.outlet ?? "-" },
    {
      label: "Periode",
      value: `${formatTanggalIndo(mulai)} ~ ${formatTanggalIndo(sampai)}`,
    },
    { label: "Jenis Durasi", value: `${analisa.jenisDurasi} Durasi` },
    { label: "Jenis Layanan", value: `${analisa.jenisLayanan} Layanan` },
  ];

  // Baris "Urutkan" (label + dropdown) — nilai sama dengan `?urutkan=`.
  const barisUrutkan = (
    <UrutkanSelect value={urutkan} mulai={mulai} sampai={sampai} />
  );

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      {/* Header + breadcrumbs */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Laporan", href: "/laundry/laporan" },
            {
              label: "Analisa Layanan",
              href: "/laundry/analisa/layanan",
              active: true,
            },
          ]}
        />
      </div>

      {/* ============ Ringkasan (bagian atas) ============ */}
      {/* Langsung di dalam konten halaman (tanpa wrapper padding ekstra),
          pola sama dengan fieldset di app/laundry/analisa/pelanggan/page.tsx
          agar jarak kiri/kanan identik. */}
      <fieldset className="mt-4 min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Analisa Layanan
        </legend>

        {/* Portrait: baris info (satu kolom) */}
        <div className="md:hidden landscape:hidden divide-y divide-gray-100">
          {infoItems.map((item) => (
            <BarisInfo
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
          {/* Baris "Urutkan": label kiri, dropdown kanan (lebar terbatas,
              pola sama dengan kartu statistik di Analisa Pelanggan). */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <span className="shrink-0 text-sm text-gray-700">Urutkan</span>
            <div className="w-44 sm:w-56">{barisUrutkan}</div>
          </div>
        </div>

        {/* Landscape/desktop: 2 kolom — info, lalu baris "Urutkan" melebar */}
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
          <div className="col-span-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <span className="shrink-0 text-sm text-gray-700">Urutkan</span>
            <div className="w-56 max-w-xs">{barisUrutkan}</div>
          </div>
        </div>
      </fieldset>

      {/* ============ Peringkat layanan ============ */}
      <fieldset className="mt-5 min-w-0 rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Peringkat Layanan
        </legend>

        {analisa.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Tidak ada data layanan pada periode ini.
          </p>
        ) : (
          <>
            {/* Portrait: daftar peringkat (satu kolom, divide-y) */}
            <div className="md:hidden landscape:hidden divide-y divide-gray-100">
              {analisa.items.map((item, i) => (
                <BarisPeringkat
                  key={`${item.namaLayanan}-${item.tipe}-${item.durasi}-${i}`}
                  nomor={i + 1}
                  namaLayanan={item.namaLayanan}
                  kategori={`${item.durasi ?? "-"} - ${item.tipe ?? "-"}`}
                  nilai={item.nilai}
                  kuantitas={item.kuantitas}
                  satuan={item.satuan}
                />
              ))}
            </div>

            {/* Landscape/desktop: daftar peringkat 2 kolom — border-b baris
                terakhir (1-2 item) disembunyikan agar tidak ada garis
                gantung di bawah fieldset. */}
            <div className="hidden md:grid landscape:grid grid-cols-2 gap-x-8 [&>*:nth-last-child(-n+2)]:border-b-0">
              {analisa.items.map((item, i) => (
                <BarisPeringkat
                  key={`${item.namaLayanan}-${item.tipe}-${item.durasi}-${i}`}
                  nomor={i + 1}
                  namaLayanan={item.namaLayanan}
                  kategori={`${item.durasi ?? "-"} - ${item.tipe ?? "-"}`}
                  nilai={item.nilai}
                  kuantitas={item.kuantitas}
                  satuan={item.satuan}
                  className="border-b border-gray-100"
                />
              ))}
            </div>
          </>
        )}
      </fieldset>
    </div>
  );
}
