'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function updateAppHeight() {
  document.documentElement.style.setProperty(
    '--app-height',
    `${window.innerHeight}px`,
  );
}

export default function ViewportHeightFix() {
  const pathname = usePathname();

  useEffect(() => {
    updateAppHeight();

    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
    };
  }, [pathname]);

  return null;
}
