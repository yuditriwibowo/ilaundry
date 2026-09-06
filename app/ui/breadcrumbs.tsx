import { clsx } from "clsx";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
  className,
}: {
  breadcrumbs: Breadcrumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("block", className ?? "mb-6")}>
      <ol className="flex flex-wrap items-center text-sm sm:text-base md:text-xl landscape:text-base short-screen:text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(
              breadcrumb.active
                ? "font-semibold text-white portrait:text-white landscape:text-gray-900 md:text-gray-900"
                : "text-white/70 portrait:text-white/70 landscape:text-gray-500 md:text-gray-500 hover:underline",
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-2 sm:mx-3 inline-block text-white/50 portrait:text-white/50 landscape:text-gray-300 md:text-gray-300">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

