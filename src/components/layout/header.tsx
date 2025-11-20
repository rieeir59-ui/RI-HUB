'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

const RiLogo = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 20V80H40V55L60 80H80L55 50L80 20H60L40 45V20H20Z"
        fill="black"
      />
    </svg>
  );

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-md">
       <div className="bg-gray-800 text-white text-sm py-2">
        <div className="container flex justify-between items-center">
          <span>Welcome to RI-HUB (Software Engineers)</span>
        </div>
      </div>
      <div className="container flex h-24 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
           <div
              className="relative bg-primary"
              style={{
                clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)',
                width: '250px',
              }}
            >
              <div className="flex items-center p-4">
                <RiLogo />
                <span className="ml-2 font-headline text-2xl font-bold text-black">
                  RI-HUB
                </span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary px-4 py-2 rounded-md font-semibold',
                pathname === link.href
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-foreground/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
