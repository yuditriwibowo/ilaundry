// Helper bersama untuk action pesanan & item pesanan. File ini TIDAK memakai
// "use server" — isinya helper internal (bukan server action publik), sehingga
// helper non-async dan type boleh diekspor dari sini.

import { sql } from "../../db";
import type { TabelLayanan, Diskon, TipeTransaksi } from "../../definitions";

// Tipe transaksi postgres.js diambil dari instance `sql` aplikasi, sehingga
// helper di bawah selalu cocok dengan transaksi yang diberikan `sql.begin`.
export type PesananTx = Parameters<Parameters<typeof sql.begin>[1]>[0];

/**
 * Hitung ulang kolom biaya pesanan dari SELURUH item pesanan tersebut.
 * Rumus identik dengan createPesanan/updatePesanan:
 *   total_layanan = SUM(subtotal)
 *   nilai_diskon  = SUM(nilai_diskon)
 *   total_bayar   = max(0, total_layanan + biaya_antar_jemput - nilai_diskon)
 *   status_pembayaran & kurang_bayar dihitung dari jumlah_bayar
 *   tgl_estimasi_selesai = MAX(tgl_estimasi_selesai) item
 * Dipanggil setelah item pesanan ditambah/diubah/dihapus agar angka di list,
 * detail, dan struk selalu sinkron. WAJIB dipanggil di dalam transaksi yang
 * sama dengan perubahan item-nya.
 */
export async function recalcPesananTotals(
  tx: PesananTx,
  pesananId: string,
  nowIso: string,
  userId: string | null,
) {
  const totals = await tx<
    {
      total_layanan: string;
      nilai_diskon: string;
      tgl_estimasi_selesai: string | Date | null;
    }[]
  >`
    SELECT
      COALESCE(SUM(subtotal), 0) AS total_layanan,
      COALESCE(SUM(nilai_diskon), 0) AS nilai_diskon,
      MAX(tgl_estimasi_selesai) AS tgl_estimasi_selesai
    FROM item_pesanan
    WHERE pesanan_id = ${pesananId}
  `;
  const totalLayanan = Number(totals[0]?.total_layanan ?? 0);
  const totalDiskon = Number(totals[0]?.nilai_diskon ?? 0);
  const estimasiRaw = totals[0]?.tgl_estimasi_selesai ?? null;
  const estimasiDate = estimasiRaw ? new Date(estimasiRaw) : null;
  const tglEstimasiSelesai =
    estimasiDate && !Number.isNaN(estimasiDate.getTime())
      ? estimasiDate.toISOString()
      : null;

  // biaya_antar_jemput & jumlah_bayar tidak diubah oleh aksi item; keduanya
  // dibaca langsung di SQL agar total bayar, kurang bayar, dan status
  // pembayaran selalu konsisten dengan nilai terbaru di database.
  await tx`
    UPDATE pesanan SET
      total_layanan = ${totalLayanan},
      nilai_diskon = ${totalDiskon},
      total_bayar = GREATEST(0, ${totalLayanan} + biaya_antar_jemput - ${totalDiskon}),
      status_pembayaran = CASE
        WHEN jumlah_bayar <= 0 THEN 'belum_bayar'
        WHEN jumlah_bayar >= GREATEST(0, ${totalLayanan} + biaya_antar_jemput - ${totalDiskon}) THEN 'lunas'
        ELSE 'DP'
      END,
      kurang_bayar = GREATEST(
        0,
        GREATEST(0, ${totalLayanan} + biaya_antar_jemput - ${totalDiskon}) - jumlah_bayar
      ),
      tgl_estimasi_selesai = ${tglEstimasiSelesai},
      last_update = ${nowIso},
      update_by = ${userId}
    WHERE id = ${pesananId}
  `;
}

// Snapshot item pesanan hasil resolveItemSnapshot.
export type ItemSnapshot =
  | {
      snapshot: {
        layanan: TabelLayanan;
        namaParfum: string | null;
        diskonId: string | null;
        subtotal: number;
        nilaiDiskon: number;
        subtotalFinal: number;
        estimasi: string | null;
      };
    }
  | { error: string };

/**
 * Ambil snapshot layanan/parfum/diskon dari database (harga TIDAK dipercaya
 * dari klien) lalu hitung biaya item. Dipakai bersama oleh createItemPesanan &
 * updateItemPesanan agar aturan harga, diskon, dan estimasi selalu identik
 * dengan createPesanan/updatePesanan:
 * - diskon Persentase: (nilai_diskon / 100) * subtotal
 * - diskon Nominal: nilai_diskon langsung dipakai
 * - nilai diskon dibatasi maksimal subtotal item
 * - estimasi = sekarang + lama_durasi layanan
 */
export async function resolveItemSnapshot(input: {
  layanan_id: string;
  jumlah: number;
  parfum_id?: string;
  diskon_id?: string;
  now: Date;
}): Promise<ItemSnapshot> {
  const { layanan_id, jumlah, parfum_id, diskon_id, now } = input;

  // Snapshot layanan (join tipe & durasi) — sumber harga yang sah
  const layananRows = await sql<TabelLayanan[]>`
    SELECT
      l.id,
      l.nama_layanan,
      l.harga,
      tl.nama_tipe,
      d.nama_durasi,
      d.lama_durasi,
      t.nama_toko
    FROM layanan l
    JOIN tipe_layanan tl ON l.tipe_id = tl.id
    JOIN durasi d ON l.durasi_id = d.id
    LEFT JOIN toko t ON l.toko_id = t.id
    WHERE l.id = ${layanan_id}
  `;
  const layanan = layananRows[0];
  if (!layanan) {
    return {
      error: "Layanan tidak ditemukan. Silakan periksa kembali item pesanan.",
    };
  }

  let namaParfum: string | null = null;
  if (parfum_id) {
    const parfumRows = await sql<{ id: string; nama_parfum: string }[]>`
      SELECT id, nama_parfum FROM parfum WHERE id = ${parfum_id}
    `;
    namaParfum = parfumRows[0]?.nama_parfum ?? null;
  }

  const subtotal = Number(layanan.harga) * jumlah;
  let diskonId: string | null = null;
  let nilaiDiskon = 0;
  if (diskon_id) {
    const diskonRows = await sql<
      Pick<Diskon, "id" | "tipe_diskon" | "nilai_diskon">[]
    >`
      SELECT id, tipe_diskon, nilai_diskon FROM diskon WHERE id = ${diskon_id}
    `;
    const diskon = diskonRows[0];
    if (diskon) {
      diskonId = diskon.id;
      nilaiDiskon = Math.min(
        Math.max(
          0,
          diskon.tipe_diskon === "Persentase"
            ? Math.round((Number(diskon.nilai_diskon) / 100) * subtotal)
            : Number(diskon.nilai_diskon),
        ),
        subtotal,
      );
    }
  }

  const subtotalFinal = Math.max(0, subtotal - nilaiDiskon);
  const estimasi =
    layanan.lama_durasi != null
      ? new Date(
          now.getTime() + Number(layanan.lama_durasi) * 60 * 60 * 1000,
        ).toISOString()
      : null;

  return {
    snapshot: {
      layanan,
      namaParfum,
      diskonId,
      subtotal,
      nilaiDiskon,
      subtotalFinal,
      estimasi,
    },
  };
}

/**
 * Insert transaksi keuangan ke tabel transaksi_keuangan.
 * Dipakai oleh action pesanan untuk mencatat pembayaran, pembatalan, dll.
 */
export async function insertTransaksiKeuangan(params: {
  tx: PesananTx;
  waktu_transaksi?: string | null;
  nama_transaksi: string;
  tipe_transaksi: TipeTransaksi | null;
  nilai_debet?: number | null;
  nilai_kredit?: number | null;
  pesanan_id: string;
  toko_id: string | null;
  keterangan: string | null;
  update_by: string | null;
}) {
  const {
    tx,
    waktu_transaksi,
    nama_transaksi,
    tipe_transaksi,
    nilai_debet,
    nilai_kredit,
    pesanan_id,
    toko_id,
    keterangan,
    update_by,
  } = params;

  const nowIso = new Date().toISOString();

  // Jika nilai_debet diisi >0, nilai kredit diisi 0.
  // Sebaliknya juga berlaku, jika nilai_kredit diisi >0, nilai debet diisi 0.
  const debit = nilai_debet ?? 0;
  const kredit = nilai_kredit ?? 0;

  await tx`
    INSERT INTO transaksi_keuangan (
      waktu_transaksi,
      nama_transaksi,
      tipe_transaksi,
      nilai_debet,
      nilai_kredit,
      pesanan_id,
      toko_id,
      keterangan,
      created_at,
      last_update,
      update_by
    ) VALUES (
      ${waktu_transaksi ?? nowIso},
      ${nama_transaksi},
      ${tipe_transaksi},
      ${debit},
      ${kredit},
      ${pesanan_id},
      ${toko_id},
      ${keterangan},
      ${nowIso},
      ${nowIso},
      ${update_by}
    )
  `;
}

