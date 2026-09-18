import type { NextAuthConfig } from "next-auth";
import type { Peran, TokoAssignment } from "./definitions";

// Konfigurasi NextAuth (Auth.js v5) — bagian yang aman dipakai di mana saja.
// Provider Credentials (dengan bcrypt) ada di app/lib/auth-nextauth.ts.
type SessionPeran = Peran;

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    // Halaman login kustom: form login di halaman depan ("/").
    signIn: "/",
  },
  trustHost: true,
  callbacks: {
    // jwt: dipanggil saat sign-in (user terdefinisi) & tiap refresh token.
    // Menyimpan identitas user + daftar toko & perannya ke dalam JWT
    // sehingga tidak perlu query DB di setiap request.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.peran = user.peran ?? null;
        token.tokoId = user.tokoId ?? null;
        token.tokoList = user.tokoList ?? [];
      }
      return token;
    },
    // session: mengekspos data JWT ke objek session (client & server).
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.peran = (token.peran as SessionPeran) ?? null;
        session.user.tokoId = (token.tokoId as string) ?? null;
        session.user.tokoList = (token.tokoList as TokoAssignment[]) ?? [];
      }
      return session;
    },
  },
  providers: [], // provider diisi di auth-nextauth.ts
} satisfies NextAuthConfig;
