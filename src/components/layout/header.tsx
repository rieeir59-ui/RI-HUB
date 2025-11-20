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
      width="28"
      height="28"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M25 20V30H35V20H25Z" fill="currentColor" />
        <path d="M25 35V80H35V35H25Z" fill="currentColor" />
        <path d="M40 35H55C66.0457 35 75 43.9543 75 55C75 66.0457 66.0457 75 55 75H40V65H55C60.5228 65 65 60.5228 65 55C65 49.4772 60.5228 45 55 45H40V35Z" fill="currentColor" />
        <path d="M58 60L78 80H88L68 60H58Z" fill="currentColor" />
    </svg>
  );

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-md">
       <div className="bg-gray-800 text-white text-xs py-1">
        <div className="container flex justify-center items-center">
          <span>Welcome to RI-HUB (Software Engineers)</span>
        </div>
      </div>
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
           <div
              className="relative bg-primary flex items-center justify-center p-2 pl-4"
              style={{
                clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)',
                height: '48px'
              }}
            >
              <div className="flex items-center gap-2 text-primary-foreground">
                <RiLogo />
                <span className="font-bold text-xl">RI-HUB</span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary px-3 py-1.5 rounded-md font-semibold uppercase',
                pathname === link.href
                  ? 'bg-gray-200 text-foreground'
                  : 'text-foreground/60'
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
