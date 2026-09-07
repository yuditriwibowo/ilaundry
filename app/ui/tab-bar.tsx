"use client";

import { useEffect, useRef } from "react";

export type Tab = { key: string; label: string };

export default function TabBar({
  label,
  tabs,
  value,
  onSelect,
}: {
  label: string;
  tabs: Tab[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  // Pastikan tab aktif selalu terlihat saat nilainya berubah (mis. dari URL).
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [value]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Drag-to-scroll hanya untuk mouse; perangkat sentuh sudah bisa scroll sendiri.
    if (e.pointerType !== "mouse" || !containerRef.current) return;
    drag.current = {
      isDown: true,
      startX: e.pageX,
      scrollLeft: containerRef.current.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.isDown || !containerRef.current) return;
    const dx = e.pageX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true;
      // Capture baru dipasang setelah gerakan drag terdeteksi, agar klik
      // biasa pada tab tetap diteruskan ke tombol (tidak di-retarget ke container).
      containerRef.current.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) {
      containerRef.current.scrollLeft = drag.current.scrollLeft - dx;
    }
  };

  const endDrag = () => {
    drag.current.isDown = false;
  };

  const handleTabClick = (newValue: string) => {
    // Abaikan klik yang berasal dari gerakan drag.
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    onSelect(newValue);
  };

  const tabClass = (active: boolean) =>
    `shrink-0 cursor-pointer whitespace-nowrap rounded border px-2 py-0.5 text-xs leading-5 transition-colors ${
      active
        ? "border-primary-600 bg-primary-600 text-white"
        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="min-w-0 flex-1">
      <p className="sr-only">{label}</p>
      <div
        ref={containerRef}
        role="tablist"
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex w-full select-none items-center gap-1 overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab) => {
          const active = value === tab.key;
          return (
            <button
              key={tab.key}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleTabClick(tab.key)}
              className={tabClass(active)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
