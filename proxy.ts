import { NextResponse, type NextRequest } from "next/server";

// Optimistic auth check untuk rute /laundry/*.
// HANYA membaca cookie sesi NextAuth (tanpa query DB / verifikasi kriptografi)
// — ini pertahanan UX, pertahanan utama tetap di DAL (app/lib/auth.ts) yang
// memanggil auth() di setiap server action & halaman.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export default function proxy(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some(
    (name) => req.cookies.get(name)?.value,
  );

  if (!hasSession && req.nextUrl.pathname.startsWith("/laundry")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Rute yang dilindungi proxy. Rute publik (/, /daftar, /api/auth/*, aset
// statis) sengaja tidak masuk matcher.
export const config = {
  matcher: ["/laundry/:path*"],
};
