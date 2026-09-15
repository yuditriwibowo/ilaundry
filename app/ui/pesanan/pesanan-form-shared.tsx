/**
 * Helper & tipe bersama untuk form pesanan (create, edit, dan tambah item).
 * Sebelumnya blok ini diduplikasi di create-form.tsx & edit-form.tsx; sekarang
 * diimpor dari sini agar perhitungan diskon/satuan selalu identik dengan
 * perhitungan final di server action (app/lib/actions/pesanan.ts).
 */

export type OpsiLayanan = {
  id: string;
  nama_layanan: string;
  harga: number;
  nama_tipe: string;
  nama_durasi: string | null;
  lama_durasi?: number | null;
};

export type OpsiParfum = { id: string; nama_parfum: string };

export type OpsiDiskon = {
  id: string;
  nama_diskon: string;
  tipe_diskon: string;
  nilai_diskon: number;
};

export type OpsiAntarJemput = {
  id: string;
  nama_antar_jemput: string;
  harga_antar_jemput: number;
};

export type ItemRow = {
  key: number;
  layanan_id: string;
  jumlah: string;
  parfum_id: string;
  diskon_id: string;
};

export const inputClass =
  "peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500";

/**
 * Satuan ditentukan otomatis dari tipe layanan:
 * kiloan -> kg, satuan -> pcs, meteran -> m
 */
export function satuanDariTipe(namaTipe: string | null | undefined): string {
  const tipe = (namaTipe ?? "").toLowerCase();
  if (tipe.includes("kiloan")) return "kg";
  if (tipe.includes("satuan")) return "pcs";
  if (tipe.includes("meteran")) return "m";
  return "kg";
}

export function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors) return null;
  return (
    <>
      {errors.map((error) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </>
  );
}

/**
 * Perhitungan diskon per item:
 * - Persentase: (diskon.nilai_diskon / 100) * subtotal item
 * - Nominal: diskon.nilai_diskon langsung dipakai
 * Nilai diskon per item dibatasi maksimal subtotal item agar subtotal_final
 * tidak negatif. Rumus ini harus sama dengan perhitungan di server action.
 */
export function hitungItem(
  item: Pick<ItemRow, "layanan_id" | "jumlah" | "diskon_id">,
  layananMap: Map<string, OpsiLayanan>,
  diskonMap: Map<string, OpsiDiskon>,
) {
  const layanan = layananMap.get(item.layanan_id);
  const jumlah = Number(item.jumlah) || 0;
  const subtotal = layanan ? Number(layanan.harga) * jumlah : 0;
  const diskon = item.diskon_id ? diskonMap.get(item.diskon_id) : undefined;
  const nilaiDiskon = diskon
    ? Math.min(
        Math.max(
          0,
          diskon.tipe_diskon === "Persentase"
            ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
            : Number(diskon.nilai_diskon),
        ),
        subtotal,
      )
    : 0;
  const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
  return { subtotal, nilaiDiskon, subtotalFinal };
}
