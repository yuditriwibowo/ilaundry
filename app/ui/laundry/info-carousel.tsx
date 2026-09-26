"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay";
import { InfoIklan } from "@/app/lib/definitions";

/**
 * Carousel Informasi & Iklan (beranda).
 *
 * - Client component karena memakai hooks (state, embla, autoplay).
 * - Data slide dari tabel info_iklan via prop `slides` — hanya iklan
 *   yang aktif (lihat fetchInfoIklanForCarousel di app/lib/data).
 * - Slide tanpa image_src memakai placeholder /carousel/placeholder.svg.
 * - image_src berupa path internal /carousel/<file> (hasil upload) —
 *   Image optimized (bukan unoptimized).
 * - Tidak ada slide aktif -> carousel disembunyikan (render null).
 */
const FALLBACK_IMAGE = "/carousel/placeholder.svg";

const AUTOPLAY_DELAY = 4500;

// Bentuk data slide dari fetchInfoIklanForCarousel (subset kolom info_iklan).
type SlideInfoIklan = Pick<
  InfoIklan,
  "id" | "title" | "description" | "image_src" | "link"
>;

export default function InfoCarousel({ slides }: { slides: SlideInfoIklan[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, align: "start" },
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

  // Tidak ada info/iklan aktif — sembunyikan carousel.
  if (!slides || slides.length === 0) {
    return null;
  }

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
          {slides.map((slide, index) => {
            const imageSrc = slide.image_src || FALLBACK_IMAGE;
            const title = slide.title ?? "Info & Iklan";
            const content = (
              <>
                <Image
                  src={imageSrc}
                  alt={title}
                  width={1200}
                  height={400}
                  className="h-auto w-full"
                  priority={index === 0}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-3 pl-4 pr-3 md:py-2.5 md:pl-5 md:pr-3 pt-10">
                  <p className="text-sm md:text-sm font-semibold text-white leading-tight">
                    {title}
                  </p>
                  {slide.description && (
                    <p className="text-[11px] md:text-[11px] text-gray-200">
                      {slide.description}
                    </p>
                  )}
                </div>
              </>
            );

            return (
              <div
                key={slide.id}
                className="relative min-w-0 flex-[0_0_100%] pl-3 md:flex-[0_0_33.333%]"
              >
                {slide.link ? (
                  <a
                    href={slide.link}
                    className="block overflow-hidden rounded-lg md:rounded-xl"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="block overflow-hidden rounded-lg md:rounded-xl">
                    {content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ke slide ${index + 1}: ${slide.title ?? "Info & Iklan"}`}
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
