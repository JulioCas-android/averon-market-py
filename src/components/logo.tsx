import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center" aria-label="AVERON Market PY Inicio">
      <Image
        src="https://i.imgur.com/UpxHMxI.png"
        alt="Logotipo de AVERON Market PY"
        width={40}
        height={40}
        priority
        className="object-contain h-8 w-8 md:h-9 md:w-9"
      />
    </Link>
  );
}
