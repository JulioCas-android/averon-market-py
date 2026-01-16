import Link from 'next/link';
import { Store } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <Store className="h-5 w-5" />
      </div>
      <span className="font-bold text-lg hidden sm:inline-block">Averon Market</span>
    </Link>
  );
}
