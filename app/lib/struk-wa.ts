// Helper browser murni untuk kirim WhatsApp & cetak struk pesanan/item.
// Bukan komponen React — dipakai oleh tombol-tombol di app/ui/pesanan/buttons.

import type {
  StatusPesanan,
  StatusPembayaran,
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

export function kirimWa({
  noHp,
  nama,
  nomorPesanan,
  totalBayar,
  statusPesanan,
  statusPembayaran,
}: {
  noHp: string | null;
  nama: string | null;
  nomorPesanan: string | null;
  totalBayar: number;
  statusPesanan: StatusPesanan;
  statusPembayaran: StatusPembayaran;
}) {
  if (!noHp) {
    alert("Nomor HP pelanggan tidak tersedia.");
    return;
  }
  const message = [
    `Halo ${nama ?? "Kak"},`,
    "",
    `Pesanan ${nomorPesanan ?? "-"} dengan status *${statusPesananText[statusPesanan]}* dan pembayaran *${statusPembayaranText[statusPembayaran]}*.`,
    `Total bayar: ${formatRupiah(totalBayar)}.`,
    "",
    "Terima kasih telah mempercayakan cucian Anda kepada kami.",
  ].join("\n");
  const url = `https://wa.me/${normalizePhoneNumber(noHp)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function printStruk(pesanan: TabelPesanan) {
  const win = window.open("", "_blank", "width=480,height=640");
  if (!win) return;

  const rows: [string, string][] = [
    ["No. Pesanan", pesanan.nomor_pesanan ?? "-"],
    ["Tanggal", formatDateTimeToLocal(pesanan.tgl_pesanan)],
    ["Pelanggan", pesanan.nama_pelanggan ?? "-"],
    ["No. HP", pesanan.no_hp ?? "-"],
    ["Kasir", pesanan.nama_user ?? "-"],
    ["Status Pesanan", statusPesananText[pesanan.status_pesanan]],
    ["Status Bayar", statusPembayaranText[pesanan.status_pembayaran]],
    ["Metode Bayar", pesanan.metode_pembayaran ? metodePembayaranText[pesanan.metode_pembayaran] : "-"],
  ];

  win.document.write(`
    <html>
      <head>
        <title>${pesanan.nomor_pesanan ?? "Struk Pesanan"}</title>
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
        <p class="sub">Struk Pesanan</p>
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
          <tr><td class="label">Total Layanan</td><td>: ${formatRupiah(pesanan.total_layanan)}</td></tr>
          <tr><td class="label">Biaya Antar Jemput</td><td>: ${formatRupiah(pesanan.biaya_antar_jemput)}</td></tr>
          <tr><td class="label">Diskon</td><td>: -${formatRupiah(pesanan.nilai_diskon)}</td></tr>
          <tr class="total"><td class="label">Total Bayar</td><td>: ${formatRupiah(pesanan.total_bayar)}</td></tr>
          <tr><td class="label">Jumlah Bayar</td><td>: ${formatRupiah(pesanan.jumlah_bayar)}</td></tr>
          <tr><td class="label">Kurang Bayar</td><td>: ${formatRupiah(pesanan.kurang_bayar)}</td></tr>
        </table>
        ${pesanan.catatan ? `<hr /><p style="font-size: 11px;">Catatan: ${pesanan.catatan}</p>` : ""}
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

