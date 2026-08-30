import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'yLaundry Premium',
    short_name: 'yLaundry',
    description: 'Aplikasi Laundry Premium Terpercaya',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f4f6', // Gray-100 Tailwind to match SideNav
    theme_color: '#2563eb', // Blue-600 Tailwind for light mode
    // @ts-ignore
    dark_theme_color: '#f3f4f6', // Gray-100 Tailwind to prevent black nav bar in dark mode
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
