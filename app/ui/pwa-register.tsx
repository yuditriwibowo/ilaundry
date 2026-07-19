'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    // Only register Service Worker in production to prevent infinite HMR reload loops during development
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('PWA Service Worker registered successfully with scope:', registration.scope);
        } catch (error) {
          console.error('PWA Service Worker registration failed:', error);
        }
      };

      // Register after page load to avoid blocking initial render performance
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
        return () => window.removeEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  return null;
}
