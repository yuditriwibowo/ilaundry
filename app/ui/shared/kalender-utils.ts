/**
 * Utilitas kalender murni (tanpa DOM/React) untuk date picker custom.
 *
 * Dipisah dari komponen agar logika tanggal bisa diuji langsung (unit test).
 *
 * Aturan penting (sumber bug klasik date picker):
 * - Tanggal selalu direpresentasikan sebagai string ISO "YYYY-MM-DD" pada
 *   ZONA WAKTU LOKAL.
 * - JANGAN pernah memakai `new Date("YYYY-MM-DD")` (parse-nya UTC — tanggal
 *   bisa mundur sehari di zona waktu negatif) atau `Date.toISOString()`
 *   (konversi ke UTC — juga menggeser tanggal). Parsing dan pembentukan
 *   string selalu lewat `parseIso` / `toIso` berbasis komponen lokal.
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Nama bulan Indonesia (index = bulan 0-based, sama dengan getMonth()). */
export const BULAN_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/** Label hari pendek, diawali Minggu (kolom pertama grid kalender). */
export const HARI_INDO = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

export type PartsTanggal = {
  /** Tahun penuh (mis. 2026). */
  year: number;
  /** Bulan 0-based (0 = Januari), konsisten dengan Date.getMonth(). */
  monthIndex: number;
  /** Tanggal 1–31. */
  day: number;
};

/** Jumlah hari pada suatu bulan (memperhitungkan tahun kabisat). */
export function daysInMonth(year: number, monthIndex: number): number {
  // Tanggal 0 bulan berikutnya = hari terakhir bulan ini.
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Bentuk string ISO "YYYY-MM-DD" dari komponen tanggal lokal. */
export function toIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/**
 * Parse string ISO "YYYY-MM-DD" menjadi komponen tanggal lokal.
 * Mengembalikan null jika format salah atau tanggal tidak nyata
 * (mis. "2026-02-30", "2026-13-01") — tidak seperti `new Date()` yang
 * diam-diam menggulir ke bulan berikutnya.
 */
export function parseIso(iso: string): PartsTanggal | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11) return null;
  if (day < 1 || day > daysInMonth(year, monthIndex)) return null;
  return { year, monthIndex, day };
}

/** Hari ini (YYYY-MM-DD) pada zona waktu lokal. */
export function todayIso(): string {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Bandingkan dua ISO "YYYY-MM-DD" (-1 | 0 | 1). Aman leksikografis karena format seragam. */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Cek iso berada dalam rentang inklusif. Batas kosong = tanpa batas. */
export function isIsoInRange(
  iso: string,
  minIso: string,
  maxIso: string,
): boolean {
  return (!minIso || iso >= minIso) && (!maxIso || iso <= maxIso);
}

/** Empaskan iso ke dalam rentang inklusif (batas kosong = tanpa batas). */
export function clampIso(iso: string, minIso: string, maxIso: string): string {
  if (minIso && iso < minIso) return minIso;
  if (maxIso && iso > maxIso) return maxIso;
  return iso;
}


/**
 * Geser tanggal sejumlah bulan dengan clamping hari:
 * 31 Mar + 1 bulan = 30 Apr, 29 Feb 2024 + 12 bulan = 28 Feb 2025.
 */
export function addMonths(
  year: number,
  monthIndex: number,
  day: number,
  delta: number,
): PartsTanggal {
  // new Date menormalkan monthIndex di luar 0–11 (mis. 13 → Januari tahun
  // berikutnya) secara otomatis, jadi tidak perlu aritmetika manual.
  const target = new Date(year, monthIndex + delta, 1);
  const y2 = target.getFullYear();
  const m2 = target.getMonth();
  return { year: y2, monthIndex: m2, day: Math.min(day, daysInMonth(y2, m2)) };
}

/** Geser iso sejumlah hari (bisa negatif). Tetap akurat lintas bulan/tahun. */
export function shiftIso(iso: string, deltaDays: number): string {
  const parts = parseIso(iso);
  if (!parts) return iso;
  const shifted = new Date(parts.year, parts.monthIndex, parts.day + deltaDays);
  return toIso(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
}

/** Geser iso sejumlah bulan dengan clamping hari (untuk PageUp/PageDown). */
export function geserBulanIso(iso: string, delta: number): string {
  const parts = parseIso(iso);
  if (!parts) return iso;
  const next = addMonths(parts.year, parts.monthIndex, parts.day, delta);
  return toIso(next.year, next.monthIndex, next.day);
}

/** Hari dalam minggu (0 = Minggu) dari iso, untuk Home/End & offset grid. */
export function dayOfWeek(iso: string): number {
  const parts = parseIso(iso);
  if (!parts) return 0;
  return new Date(parts.year, parts.monthIndex, parts.day).getDay();
}

/** Kunci bulan (year * 12 + monthIndex) untuk membandingkan/nav antar bulan. */
export function monthKeyOf(year: number, monthIndex: number): number {
  return year * 12 + monthIndex;
}

/** Kunci bulan dari iso; null jika iso tidak valid. */
export function monthKeyOfIso(iso: string): number | null {
  const parts = parseIso(iso);
  return parts ? monthKeyOf(parts.year, parts.monthIndex) : null;
}

/** Sel kalender: iso + tanggal; null berarti kotak kosong di luar bulan. */
export type SelKalender = { iso: string; day: number } | null;

/**
 * 42 sel (6 minggu × 7 hari) untuk bulan tertentu, kolom pertama Minggu.
 * Tinggi selalu 6 baris agar ukuran kalender stabil antar bulan.
 */
export function getMonthCells(year: number, monthIndex: number): SelKalender[] {
  const firstDow = new Date(year, monthIndex, 1).getDay(); // 0 = Minggu
  const total = daysInMonth(year, monthIndex);
  const cells: SelKalender[] = [];
  for (let i = 0; i < 42; i += 1) {
    const dayNum = i - firstDow + 1;
    cells.push(
      dayNum >= 1 && dayNum <= total
        ? { iso: toIso(year, monthIndex, dayNum), day: dayNum }
        : null,
    );
  }
  return cells;
}

/** Format iso untuk ditampilkan: "26 Juni 2026". Kosong jika tidak valid. */
export function formatTanggal(iso: string): string {
  const parts = parseIso(iso);
  if (!parts) return "";
  return `${parts.day} ${BULAN_INDO[parts.monthIndex]} ${parts.year}`;
}

/** "Juni 2026" untuk header kalender. */
export function formatBulanTahun(year: number, monthIndex: number): string {
  return `${BULAN_INDO[monthIndex]} ${year}`;
}
