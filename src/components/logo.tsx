import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <linearGradient id="swoosh-gradient-logo" x1="4.5" y1="36" x2="38" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#F59E0B"/>
                  <stop offset="1" stop-color="#F97316"/>
              </linearGradient>
          </defs>
          <path d="M21.33 1.33L0 40H8.33L13.66 26.66H30.33L35.66 40H44L27.66 1.33H21.33ZM17.33 21.33L22.5 8.33L27.66 21.33H17.33Z" fill="hsl(var(--primary))"/>
          <path d="M2 34C15 30, 30 30, 39 24C43 21, 41 15, 37 14C25 12, 10 20, 5 30C2.5 35, 0 36, 2 34Z" fill="url(#swoosh-gradient-logo)"/>
          <path d="M37 12L38.5 9L40 12L43 13.5L40 15L38.5 18L37 15L34 13.5L37 12Z" fill="#FBBF24"/>
      </svg>
      <div className="hidden sm:inline-flex flex-col items-start">
        <span className="font-extrabold text-xl tracking-tight averon-gradient-text">
          AVERON
        </span>
        <span className="bg-secondary text-secondary-foreground text-[0.6rem] font-semibold px-2 py-[1px] rounded-sm -mt-1 tracking-widest shadow-sm">
          MARKET PY
        </span>
      </div>
    </Link>
  );
}
