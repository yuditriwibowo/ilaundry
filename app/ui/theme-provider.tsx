"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Provider untuk pengaturan Mode Display (terang / gelap / sesuai system).
 *
 * - Preferensi disimpan di localStorage dengan key "theme".
 * - Class "dark" di-toggle pada elemen <html> (strategi class Tailwind).
 * - Script inline di app/layout.tsx menerapkan tema sebelum hydrate
 *   agar tidak terjadi flash (FOUC).
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
  /** Mode yang dipilih user: "light" | "dark" | "system" */
  theme: ThemeMode;
  /** Tema yang sedang aktif setelah memperhitungkan preferensi system */
  resolvedTheme: ResolvedTheme;
  /** Ubah mode display dan simpan preferensinya */
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemDark() ? "dark" : "light";
  return mode;
}

function applyTheme(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Baca preferensi tersimpan setelah mount (menghindari hydration mismatch).
  // Nilai awal sudah diterapkan oleh script inline di layout.
  useEffect(() => {
    let stored: ThemeMode = "system";
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === "light" || value === "dark" || value === "system") {
        stored = value;
      }
    } catch {
      // localStorage tidak tersedia (mis. private mode) — pakai default "system"
    }
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
  }, []);

  // Saat mode "system", ikuti perubahan preferensi sistem operasi secara real-time
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedTheme(applyTheme("system"));
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // abaikan jika penyimpanan tidak tersedia
    }
    setResolvedTheme(applyTheme(mode));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}