import Breadcrumbs from "@/app/ui/breadcrumbs";
import {
  fetchLaporanKasPeriode,
  fetchFilteredTransaksiKas,
  fetchLaporanKasPages,
  type SaldoPerTipe,
} from "@/app/lib/data/kas";
import LaporanKasInfiniteList from "@/app/ui/kas/laporan-kas-infinite-list";
import {
  formatRupiah,
  formatDateTimeToLocal,
} from "@/app/lib/utils";

/**
 * Halaman Laporan Kas (mutasi kas per periode).
 *
 * - searchParams `mulai` & `sampai` (YYYY-MM-DD) divalidasi di server:
 *   maksimal 3 bulan yang lalu, sampai >= mulai, tidak melebihi hari ini.
 * - Bagian atas: ringkasan saldo awal / pendapatan / penambahan kas /
 *   pengurangan kas / saldo akhir (+ rincian tunai & non-tunai), dengan
 *   style fieldset project (rounded-xl border bg-white shadow-sm + legend).
 * - Bagian bawah: daftar transaksi_keuangan sesuai rentang tanggal & toko
 *   terpilih — tabel di landscape/desktop, infinite list di mobile portrait.
 */

// Rentang default & maksimum: 3 bulan terakhir.
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

// "21 Sep 2026" untuk tampilan periode.
function formatTanggalIndo(tgl: string): string {
  const [y, m, d] = tgl.split("-").map(Number);
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${String(d).padStart(2, "0")} ${bulan[m - 1]} ${y}`;
}

/** Baris ringkasan utama: label kiri, nilai total kanan. */
function RingkasanUtama({
  label,
  saldo,
  strong = false,
}: {
  label: string;
  saldo: SaldoPerTipe;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span
        className={`text-sm ${strong ? "font-semibold text-gray-900" : "text-gray-700"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${strong ? "font-semibold text-gray-900" : "font-medium text-gray-900"}`}
      >
        {formatRupiah(saldo.total)}
      </span>
    </div>
  );
}

/** Rincian per tipe: "Tunai : Rp x" / "Non-Tunai : Rp y" di bawah baris utama. */
function RincianTipe({ saldo }: { saldo: SaldoPerTipe }) {
  return (
    <div className="mb-1 ml-4 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-gray-500">Tunai :</span>
        <span className="text-xs text-gray-500">
          {formatRupiah(saldo.tunai)}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-gray-500">Non-Tunai :</span>
        <span className="text-xs text-gray-500">
          {formatRupiah(saldo.nonTunai)}
        </span>
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

  const laporan = await fetchLaporanKasPeriode(mulai, sampai);
  const transaksi = await fetchFilteredTransaksiKas(mulai, sampai, 1);
  const totalPages = await fetchLaporanKasPages(mulai, sampai);

  const infoItems = [
    { label: "Outlet", value: laporan.outlet ?? "-" },
    {
      label: "Periode",
      value: `${formatTanggalIndo(mulai)} ~ ${formatTanggalIndo(sampai)}`,
    },
  ];

  const ringkasanItems: {
    label: string;
    saldo: SaldoPerTipe;
    strong?: boolean;
  }[] = [
    { label: "Saldo Awal", saldo: laporan.saldoAwal },
    { label: "Pendapatan", saldo: laporan.pendapatan },
    { label: "Penambahan Kas", saldo: laporan.penambahanKas },
    { label: "Pengurangan Kas", saldo: laporan.penguranganKas },
    { label: "Saldo Akhir", saldo: laporan.saldoAkhir, strong: true },
  ];

  return (
    <div className="flex min-h-full w-full flex-col -mt-2">
      {/* Header + breadcrumbs */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] portrait:sticky portrait:top-0 portrait:z-20 md:bg-none md:bg-transparent md:shadow-none md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Laporan", href: "/laundry/laporan" },
            { label: "Laporan Kas", href: "/laundry/laporan/kas", active: true },
          ]}
        />
      </div>

      <div className="p-4 md:p-6">
        {/* ============ Ringkasan (bagian atas) ============ */}
        <fieldset className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 short-screen:p-3 shadow-sm">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Ringkasan Kas
          </legend>

          {/* Portrait: satu kolom (divide-y) */}
          <div className="md:hidden landscape:hidden">
            {/* Info outlet & periode (label kiri, nilai kanan) */}
            <div className="divide-y divide-gray-100">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-3 py-1.5"
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            {/* Saldo awal/pendapatan/penambahan/pengurangan/saldo akhir + rincian */}
            <div className="mt-3 border-t border-gray-100 pt-2">
              {ringkasanItems.map((item) => (
                <div key={item.label}>
                  <RingkasanUtama
                    label={item.label}
                    saldo={item.saldo}
                    strong={item.strong}
                  />
                  <RincianTipe saldo={item.saldo} />
                </div>
              ))}
            </div>
          </div>

          {/* Landscape/desktop: 2 kolom, Saldo Akhir melebar penuh */}
          <div className="hidden md:grid landscape:grid grid-cols-2 gap-x-8 gap-y-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
            {ringkasanItems.map((item) => (
              <div
                key={item.label}
                className={
                  item.strong
                    ? "col-span-2 md:col-span-2 landscape:col-span-2 border-t border-gray-100 pt-3"
                    : ""
                }
              >
                <RingkasanUtama
                  label={item.label}
                  saldo={item.saldo}
                  strong={item.strong}
                />
                <RincianTipe saldo={item.saldo} />
              </div>
            ))}
          </div>
        </fieldset>

        {/* ============ Daftar transaksi (bagian bawah) ============ */}
        <div className="mt-6 flow-root">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Portrait: infinite list */}
            <div className="md:hidden landscape:hidden">
              <LaporanKasInfiniteList
                key={`${mulai}-${sampai}`}
                initialItems={transaksi}
                mulai={mulai}
                sampai={sampai}
                totalPages={totalPages}
              />
            </div>
            {/* Landscape / desktop: tabel */}
            <div className="overflow-x-auto w-full">
              <table className="hidden w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr className="border-b">
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Waktu
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Transaksi
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Tipe
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Keterangan
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Debet
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Kredit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {transaksi.map((item) => {
                    const debet = Number(item.nilai_debet) || 0;
                    const kredit = Number(item.nilai_kredit) || 0;
                    return (
                      <tr
                        key={item.id}
                        className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-primary-50/40 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                      >
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                          {item.waktu_transaksi
                            ? formatDateTimeToLocal(item.waktu_transaksi)
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className="font-medium">
                            {item.nama_transaksi ?? "-"}
                          </span>
                          {item.nomor_pesanan ? (
                            <span className="block text-xs text-gray-500">
                              {item.nomor_pesanan}
                            </span>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {item.tipe_transaksi === "tunai"
                            ? "Tunai"
                            : "Non Tunai"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="block max-w-[240px] truncate">
                            {item.keterangan || "-"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          {debet > 0 ? formatRupiah(debet) : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          {kredit > 0 ? formatRupiah(kredit) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
