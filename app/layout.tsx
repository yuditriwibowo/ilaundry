import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import Header from "./ui/header";
import Link from "next/link";
import PWARegister from "@/app/ui/pwa-register";
import ViewportHeightFix from "@/app/ui/viewport-height-fix";
import { ThemeProvider } from "@/app/ui/theme-provider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "yLaundry Premium",
  description: "Aplikasi Laundry Premium Terpercaya",
  appleWebApp: {
    capable: true,
    title: "yLaundry",
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  themeColor: "#60a5fa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

/*
 * Terapkan tema (class "dark" pada <html>) sebelum halaman dirender
 * agar tidak terjadi flash tampilan terang saat memakai mode gelap.
 * Nilai dibaca dari localStorage "theme": light | dark | system (default).
 */
const themeInitScript = `
(function () {
  try {
    var mode = localStorage.getItem("theme");
    var dark =
      mode === "dark" ||
      ((mode === "system" || mode === null || mode === undefined) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full w-full overflow-hidden"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      {/* --app-height di-set via JS agar tinggi viewport akurat di PWA mobile */}
      <body
        className={`${inter.className} antialiased flex flex-col h-[var(--app-height,100svh)] w-full max-w-[100vw] overflow-hidden`}
      >
        <ThemeProvider>
          <PWARegister />
          <ViewportHeightFix />
          {/* Header flex-none agar mengambil tinggi sesuai konten tanpa menggunakan fixed/margin-top */}
          <Header />
          {/* flex-1 min-h-0 membuat main mengambil tepat sisa ruang viewport tanpa terdorong keluar layar */}
          <main className="flex-1 min-h-0 w-full max-w-full flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
