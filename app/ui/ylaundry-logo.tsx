
function YlaundryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="8"
        y="14"
        width="48"
        height="42"
        rx="6"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="8"
        y1="24"
        x2="56"
        y2="24"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="18" cy="19" r="3" fill="currentColor" />
      <circle cx="28" cy="19" r="3" fill="currentColor" />
      <circle
        cx="32"
        cy="40"
        r="14"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M22 40c0-5.5 6.3-8.5 10-8.5s10 3 10 8.5-6.3 8.5-10 8.5-10-3-10-8.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="46" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="53" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="41" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function YlaundryLogo() {
  return (
    <div
      className="flex flex-row items-center gap-2 leading-none text-white font-sans"
    >
      <YlaundryIcon className="h-10 w-10 md:h-12 md:w-12 shrink-0" />
      <p className="text-[32px] md:text-[44px]">yLaundry</p>
    </div>
  );
}
