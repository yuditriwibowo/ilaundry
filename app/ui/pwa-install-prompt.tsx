'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Cek apakah sudah berjalan dalam mode standalone (sudah terinstall sebagai PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. Cek apakah user sudah menutup prompt pada sesi browsing ini
    const isDismissedThisSession = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (isDismissedThisSession) {
      return;
    }

    // 3. Deteksi perangkat iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    // 4. Handle event 'beforeinstallprompt' untuk Android / Desktop (Chrome, Edge, dll)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Untuk iOS: karena Safari tidak mendukung beforeinstallprompt, tampilkan panduan setelah jeda singkat
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setIsIOS(true);
        setShowPrompt(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // 6. Listener ketika aplikasi berhasil diinstall
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Munculkan dialog instalasi native bawaan browser
    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-opacity animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-prompt-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl border border-gray-100 dark:border-gray-700 transition-all">
        {/* Tombol Tutup (X) */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Konten Atas: Icon + Nama Aplikasi */}
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex-shrink-0">
            <Image
              src="/icon-192x192.png"
              alt="yLaundry Icon"
              width={56}
              height={56}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h3 id="pwa-prompt-title" className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              Install yLaundry
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
              Aplikasi Laundry Premium
            </p>
          </div>
        </div>

        {/* Deskripsi */}
        <p className="mt-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Pasang aplikasi di layar utama perangkat Anda untuk akses instan, lebih responsif, dan tampilan layar penuh tanpa browser bar.
        </p>

        {/* Khusus Perangkat iOS (Safari): Panduan Manual */}
        {isIOS ? (
          <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3.5 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
              <span>Cara pasang di iPhone / iPad:</span>
            </div>
            <ol className="space-y-1.5 pl-1 text-[11px] leading-snug">
              <li className="flex items-center gap-1.5">
                <span className="font-bold">1.</span>
                <span>Ketuk ikon bagikan</span>
                <Share className="h-3.5 w-3.5 inline text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>di menu browser.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-bold">2.</span>
                <span>Pilih</span>
                <span className="inline-flex items-center gap-1 font-semibold bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  <PlusSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  Tambahkan ke Layar Utama
                </span>
              </li>
            </ol>
            <div className="pt-1">
              <button
                onClick={handleDismiss}
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        ) : (
          /* Android / Desktop (Chrome / Edge / Opera) */
          <div className="mt-5 flex items-center gap-2.5">
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 py-2.5 px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Install Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
