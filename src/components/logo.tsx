import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label="AVERON Market PY Home">
      <Image
        src="https://i.imgur.com/l67yrrA.png"
        alt="AVERON Market PY Logo"
        width={128}
        height={34}
        priority
        className="object-contain h-8 w-auto md:h-9"
      />
    </Link>
  );
}
