// Helper browser murni untuk kirim WhatsApp & cetak struk pesanan/item.
// Bukan komponen React — dipakai oleh tombol-tombol di app/ui/pesanan/buttons.

import type {
  TabelPesanan,
  ItemPesanan,
} from "./definitions";
import { formatDateTimeToLocal, formatRupiah } from "./utils";
import {
  statusPembayaranText,
  statusItemText,
  statusPesananText,
  metodePembayaranText,
} from "./pesanan-labels";
import { fetchItemPesananForStruk } from "./actions";

function normalizePhoneNumber(noHp: string) {
  const digits = noHp.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return `62${digits}`;
}

// Garis pemisah antar item pada struk/WA (40 karakter sesuai spesifikasi).
const GARIS_ITEM = "----------------------------------------";

// Teks "Estimasi Selesai": pesanan yang sudah selesai/diambil menampilkan
// tanggal selesai aktual, selain itu tanggal estimasi (pola sama dengan list).
function estimasiSelesaiText(pesanan: TabelPesanan): string {
  if (
    (pesanan.status_pesanan === "selesai" ||
      pesanan.status_pesanan === "diambil") &&
    pesanan.tgl_selesai
  ) {
    return formatDateTimeToLocal(pesanan.tgl_selesai);
  }
  return pesanan.tgl_estimasi_selesai
    ? formatDateTimeToLocal(pesanan.tgl_estimasi_selesai)
    : "-";
}

// Teks "Antar-Jemput": nama layanan antar jemput bila dipilih, selain itu Tidak.
function antarJemputText(pesanan: TabelPesanan): string {
  if (pesanan.antar_jemput_yt === "ya") {
    return pesanan.nama_antar_jemput_snapshot ?? "Ya";
  }
  return "Tidak";
}

/**
 * Susun teks struk pesanan — dipakai bersama oleh pesan WhatsApp (kirimWa)
 * dan struk cetak (printStruk) agar isi keduanya selalu identik.
 *
 * Format:
 *   Bapak/Ibu/Kakak,
 *   [Nama Pelanggan]
 *
 *   [Nomor Pesanan]
 *
 *   Status Proses / Tanggal Masuk / Estimasi Selesai / Antar-Jemput
 *
 *   RINCIAN PEMBAYARAN :
 *   Total Layanan / Biaya Antar-Jemput / Diskon / Total Tagihan /
 *   Metode Bayar / Jumlah Bayar / Kurang Bayar / Status Pembayaran
 *
 *   ITEM PESANAN :
 *   [Nama Layanan] - [Nama Durasi]
 *   [QTY][Satuan] x [Harga] - [Diskon] = [Subtotal]
 *   ----------------------------------------
 *
 *   [Nama Toko]
 *   [Alamat Toko]
 *   [Telephone Toko]
 */
export function buildStrukText(
  pesanan: TabelPesanan,
  items: ItemPesanan[],
): string {
  const metodeBayar = pesanan.metode_pembayaran
    ? metodePembayaranText[pesanan.metode_pembayaran]
    : "-";

  const barisItem =
    items
      .map((item) => {
        const jumlah = Number(item.jumlah) || 0;
        const diskon = item.nilai_diskon ?? 0;
        // Subtotal akhir item (setelah diskon); fallback ke subtotal bila null.
        const subtotal = item.subtotal_final ?? item.subtotal;
        const namaDurasi = item.durasi_snapshot
          ? ` - ${item.durasi_snapshot}`
          : "";
        return [
          `${item.nama_layanan_snapshot}${namaDurasi}`,
          `${jumlah}${item.satuan} x ${formatRupiah(item.harga_satuan)} - ${formatRupiah(diskon)} = ${formatRupiah(subtotal)}`,
          GARIS_ITEM,
        ].join("\n");
      })
      .join("\n") || "-";

  return [
    "Bapak/Ibu/Kakak,",
    pesanan.nama_pelanggan ?? "-",
    "",
    pesanan.nomor_pesanan ?? "-",
    "",
    `Status Proses : ${statusPesananText[pesanan.status_pesanan]}`,
    `Tanggal Masuk : ${formatDateTimeToLocal(pesanan.tgl_pesanan)}`,
    `Estimasi Selesai : ${estimasiSelesaiText(pesanan)}`,
    `Antar-Jemput : ${antarJemputText(pesanan)}`,
    "",
    "RINCIAN PEMBAYARAN :",
    `Total Layanan : ${formatRupiah(pesanan.total_layanan)}`,
    `Biaya Antar-Jemput : ${formatRupiah(pesanan.biaya_antar_jemput)}`,
    `Diskon : ${formatRupiah(pesanan.nilai_diskon)}`,
    `Total Tagihan : ${formatRupiah(pesanan.total_bayar)}`,
    `Metode Bayar : ${metodeBayar}`,
    `Jumlah Bayar : ${formatRupiah(pesanan.jumlah_bayar)}`,
    `Kurang Bayar : ${formatRupiah(pesanan.kurang_bayar)}`,
    `Status Pembayaran : ${statusPembayaranText[pesanan.status_pembayaran]}`,
    "",
    "ITEM PESANAN :",
    barisItem,
    "",
    pesanan.nama_toko ?? "Laundry",
    pesanan.alamat_toko ?? "-",
    pesanan.telephone_toko ?? "-",
  ].join("\n");
}

// Ambil item pesanan untuk struk/WA. Gagal fetch tidak boleh menggagalkan
// tombol — struk tetap tercetak tanpa bagian item.
async function ambilItemStruk(pesananId: string): Promise<ItemPesanan[]> {
  try {
    return await fetchItemPesananForStruk(pesananId);
  } catch (error) {
    console.error("Failed to fetch item pesanan for struk:", error);
    return [];
  }
}

export async function kirimWa(pesanan: TabelPesanan) {
  if (!pesanan.no_hp) {
    alert("Nomor HP pelanggan tidak tersedia.");
    return;
  }
  const items = await ambilItemStruk(pesanan.id);
  const message = buildStrukText(pesanan, items);
  const url = `https://wa.me/${normalizePhoneNumber(pesanan.no_hp)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function printStruk(pesanan: TabelPesanan) {
  const items = await ambilItemStruk(pesanan.id);
  const text = buildStrukText(pesanan, items);

  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;

  // Escape HTML agar isi teks aman dirender di jendela print.
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(pesanan.nomor_pesanan ?? "Struk Pesanan")}</title>
        <style>
          body { font-family: monospace; padding: 16px; color: #111; }
          pre { font-family: monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; margin: 0; }
        </style>
      </head>
      <body>
        <pre>${escapeHtml(text)}</pre>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.onafterprint = () => win.close();
}

// Struk per item pesanan: satu layanan pada sebuah pesanan.
// Data pesanan (toko/pelanggan) dipakai untuk kop struk, data item untuk isi.
export function printStrukItem(pesanan: TabelPesanan, item: ItemPesanan) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;

  const rows: [string, string][] = [
    ["No. Pesanan", pesanan.nomor_pesanan ?? "-"],
    ["No. Item", item.nomor_item_pesanan ?? "-"],
    [
      "Tanggal",
      item.tgl_item_pesanan
        ? formatDateTimeToLocal(item.tgl_item_pesanan)
        : formatDateTimeToLocal(pesanan.tgl_pesanan),
    ],
    ["Pelanggan", pesanan.nama_pelanggan ?? "-"],
    ["No. HP", pesanan.no_hp ?? "-"],
    ["Kasir", pesanan.nama_user ?? "-"],
    ["Status Pesanan", statusPesananText[pesanan.status_pesanan]],
    ["Status Item", statusItemText[item.status_item]],
  ];

  const itemRows: [string, string][] = [
    ["Layanan", item.nama_layanan_snapshot],
    ["Tipe", item.tipe_layanan_snapshot ?? "-"],
    ["Durasi", item.durasi_snapshot ?? "-"],
    ["Parfum", item.nama_parfum_snapshot ?? "-"],
    ["Qty", `${item.jumlah} ${item.satuan}`],
    ["Harga Satuan", formatRupiah(item.harga_satuan)],
    [
      "Diskon",
      item.nilai_diskon && item.nilai_diskon > 0
        ? `- ${formatRupiah(item.nilai_diskon)}`
        : "-",
    ],
  ];

  win.document.write(`
    <html>
      <head>
        <title>${item.nomor_item_pesanan ?? "Struk Item"} - ${pesanan.nomor_pesanan ?? "Pesanan"}</title>
        <style>
          body { font-family: monospace; padding: 16px; color: #111; }
          h1 { text-align: center; font-size: 16px; margin: 0 0 4px; }
          p.sub { text-align: center; font-size: 11px; margin: 0 0 12px; color: #555; }
          table { width: 100%; font-size: 12px; border-collapse: collapse; }
          td { padding: 3px 0; vertical-align: top; }
          td.label { color: #555; width: 40%; }
          hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
          .total { font-weight: bold; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${pesanan.nama_toko ?? "Laundry"}</h1>
        <p class="sub">Struk Item Pesanan</p>
        <hr />
        <table>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td class="label">${label}</td><td>: ${value}</td></tr>`,
            )
            .join("")}
        </table>
        <hr />
        <table>
          ${itemRows
            .map(
              ([label, value]) =>
                `<tr><td class="label">${label}</td><td>: ${value}</td></tr>`,
            )
            .join("")}
        </table>
        <hr />
        <table>
          <tr><td class="label">Subtotal</td><td>: ${formatRupiah(item.subtotal)}</td></tr>
          <tr class="total"><td class="label">Total Item</td><td>: ${formatRupiah(item.subtotal_final ?? item.subtotal)}</td></tr>
        </table>
        ${item.catatan_item ? `<hr /><p style="font-size: 11px;">Catatan: ${item.catatan_item}</p>` : ""}
        <hr />
        <p class="sub">Terima kasih telah mempercayakan cucian Anda kepada kami.</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.onafterprint = () => win.close();
}

