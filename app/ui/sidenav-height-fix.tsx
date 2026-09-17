'use client';

import { useEffect } from 'react';

/**
 * Mengukur tinggi aktual SideNav mobile (fixed di bawah) lalu mengeksposnya
 * sebagai CSS variable `--sidenav-height` pada <html>.
 *
 * Dipakai oleh app/laundry/layout.tsx untuk padding-bottom konten di mode
 * portrait mobile, sehingga konten selalu tepat di atas sidenav tanpa space
 * kosong — apa pun tinggi aktual sidenav (font, zoom, dsb).
 *
 * Fallback `5rem` menjaga perilaku lama saat sidenav tidak terlihat
 * (display: none di md / landscape) atau sebelum pengukuran pertama.
 */
function updateSidenavHeight() {
  const el = document.getElementById('mobile-sidenav');
  const height = el && el.offsetHeight > 0 ? `${el.offsetHeight}px` : '5rem';
  document.documentElement.style.setProperty('--sidenav-height', height);
}

export default function SidenavHeightFix() {
  useEffect(() => {
    updateSidenavHeight();

    const el = document.getElementById('mobile-sidenav');
    const observer = el ? new ResizeObserver(updateSidenavHeight) : null;
    if (el && observer) {
      observer.observe(el);
    }

    window.addEventListener('resize', updateSidenavHeight);
    window.addEventListener('orientationchange', updateSidenavHeight);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('resize', updateSidenavHeight);
      window.removeEventListener('orientationchange', updateSidenavHeight);
    };
  }, []);

  return null;
}
