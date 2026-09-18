import type { DefaultSession } from "next-auth";
import type { Peran, TokoAssignment } from "@/app/lib/definitions";

// Augmentasi tipe NextAuth (Auth.js v5):
// session user menyimpan identitas + konteks toko untuk otorisasi.
declare module "next-auth" {
  interface User {
    id: string;
    peran?: Peran | null;
    tokoId?: string | null;
    tokoList?: TokoAssignment[];
  }

  interface Session {
    user: {
      id: string;
      peran: Peran | null;
      tokoId: string | null;
      tokoList: TokoAssignment[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    peran?: Peran | null;
    tokoId?: string | null;
    tokoList?: TokoAssignment[];
  }
}
