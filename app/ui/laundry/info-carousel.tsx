"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay";

/**
 * Carousel Informasi & Iklan (prototype).
 *
 * - Client component karena memakai hooks (state, embla, autoplay).
 * - Data slide masih hardcoded sebagai prototype. Bentuk datanya
 *   sudah "DB-ready": nanti tinggal diganti hasil fetch dari tabel
 *   banner (judul, deskripsi, imageSrc, link) tanpa mengubah komponen.
 * - Gambar prototype berupa SVG placeholder di /public/carousel/.
 *   Saat production, imageSrc bisa berupa URL asset eksternal
 *   (perlu tambah `remotePatterns` di next.config.ts).
 */
const slides = [
  {
    title: "Diskon 20% Cuci Kiloan",
    description: "Promo spesial berlaku s.d. akhir bulan ini",
    imageSrc: "/carousel/promo-kiloan.svg",
    link: "/laundry/pesanan/create",
  },
  {
    title: "GRATIS Antar Jemput",
    description: "Area tertentu, minimal 5 kg",
    imageSrc: "/carousel/promo-antar-jemput.svg",
    link: "/laundry/pesanan/create",
  },
  {
    title: "Jam Operasional",
    description: "Setiap hari, 07.00 – 21.00 WIB",
    imageSrc: "/carousel/info-jam-operasional.svg",
    link: "/laundry/pesanan",
  },
  {
    title: "Paket Hemat Sepatu & Tas",
    description: "Mulai Rp25.000, cuci bersih + deodorizer",
    imageSrc: "/carousel/promo-paket-hemat.svg",
    link: "/laundry/pesanan/create",
  },
  {
    title: "Bayar Mudah dengan QRIS",
    description: "Scan, tunai, atau transfer — semua bisa",
    imageSrc: "/carousel/info-pembayaran-qris.svg",
    link: "/laundry/pesanan",
  },
];

const AUTOPLAY_DELAY = 4500;

export default function InfoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Tidak ada pemanggilan setState sinkron di sini (rule
    // react-hooks/set-state-in-effect): state awal 0 sudah cocok dengan
    // posisi awal Embla, dan event "select"/"reInit" menangani sinkronisasi.
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Fallback: kalau autoplay plugin tidak aktif, tetap geser manual via timer.
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins()?.autoplay as AutoplayType | undefined;
    if (autoplay) return;

    const id = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_DELAY);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <div className="w-full">
      {/* Viewport: overflow hidden. pausePointerEvents saat disentuh supaya
          autoplay berhenti di mobile (Embla 8+ mendukung opsi ini via
          stopOnMouseEnter untuk desktop, dan pause manual di sini). */}
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        onPointerDown={() => {
          const autoplay = emblaApi?.plugins()?.autoplay as
            | AutoplayType
            | undefined;
          autoplay?.stop();
        }}
        onPointerUp={() => {
          const autoplay = emblaApi?.plugins()?.autoplay as
            | AutoplayType
            | undefined;
          autoplay?.play();
        }}
      >
        <div className="flex -ml-3">
          {slides.map((slide) => (
            <div
              key={slide.imageSrc}
              className="relative min-w-0 flex-[0_0_100%] pl-3 md:flex-[0_0_33.333%]"
            >
              <a
                href={slide.link}
                className="block overflow-hidden rounded-lg md:rounded-xl"
              >
                <Image
                  src={slide.imageSrc}
                  alt={slide.title}
                  width={1200}
                  height={400}
                  className="h-auto w-full"
                  priority={slide.imageSrc === slides[0].imageSrc}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-3 pl-4 pr-3 md:py-2.5 md:pl-5 md:pr-3 pt-10">
                  <p className="text-sm md:text-sm font-semibold text-white leading-tight">
                    {slide.title}
                  </p>
                  <p className="text-[11px] md:text-[11px] text-gray-200">
                    {slide.description}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {slides.map((slide, index) => (
          <button
            key={slide.imageSrc}
            type="button"
            aria-label={`Ke slide ${index + 1}: ${slide.title}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex
                ? "w-5 bg-blue-600"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
