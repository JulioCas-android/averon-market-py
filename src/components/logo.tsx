import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      {/* Custom SVG logo based on branding */}
      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="8" fill="hsl(var(--primary))"/>
          <path d="M18 6L8.5 31H12.5L14.75 26.5H21.25L23.5 31H27.5L18 6ZM15.75 23.5L18 13.5L20.25 23.5H15.75Z" fill="white"/>
          <path d="M9.5 25C14.8333 24.3333 21.8 27 25.5 26" stroke="url(#paint0_linear_logo)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M24.5 10L25 11L25.5 10L25 9L24.5 10Z" fill="#FBBF24"/>
          <defs>
          <linearGradient id="paint0_linear_logo" x1="9.5" y1="25" x2="25.5" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316"/>
              <stop offset="1" stopColor="#F59E0B"/>
          </linearGradient>
          </defs>
      </svg>
      <span className="font-bold text-lg hidden sm:inline-block">
        AVERON
        <span className="font-light tracking-wider ml-1">MARKET PY</span>
      </span>
    </Link>
  );
}
