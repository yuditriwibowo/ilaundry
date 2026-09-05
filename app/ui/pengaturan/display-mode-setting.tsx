"use client";

import { useTheme, type ThemeMode } from "@/app/ui/theme-provider";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import clsx from "clsx";

const options: {
  value: ThemeMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}[] = [
  {
    value: "light",
    label: "Mode Terang",
    description: "Tampilan terang (default)",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Mode Gelap",
    description: "Nyaman digunakan di malam hari",
    icon: Moon,
  },
  {
    value: "system",
    label: "Sesuai System",
    description: "Mengikuti pengaturan perangkat anda",
    icon: Monitor,
  },
];

export default function DisplayModeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Mode Display"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(option.value)}
            className={clsx(
              "flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-200 ease-in-out",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
              isActive
                ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                : "border-gray-200 hover:border-primary-300 hover:bg-gray-50",
            )}
          >
            <div
              className={clsx(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-200",
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              <Icon size={20} />
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className={clsx(
                  "flex items-center gap-1 font-bold",
                  isActive ? "text-primary-600" : "text-gray-700",
                )}
              >
                {option.label}
                {isActive && <Check size={14} className="shrink-0" />}
              </span>
              <span className="text-xs leading-tight text-gray-500">
                {option.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}