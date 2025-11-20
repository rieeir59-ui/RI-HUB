'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

const RiLogo = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-black"
    >
        <path d="M25,80 L25,30 L35,30 L35,80 L25,80 Z M50,80 L40,80 L40,30 L50,30 L65,30 C77.5,30 85,40 85,55 C85,70 77.5,80 65,80 L50,80 Z M50,70 L65,70 C72.5,70 75,65 75,55 C75,45 72.5,40 65,40 L50,40 L50,70 Z" fill="currentColor"/>
    </svg>
  );

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-md">
       <div className="bg-sidebar text-white text-sm py-2">
        <div className="container flex justify-center items-center">
          <span>Welcome to RI-HUB (Software Engineers)</span>
        </div>
      </div>
      <div className="container flex h-24 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
           <div
              className="relative bg-primary flex items-center justify-center p-2"
              style={{
                clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)',
                height: '96px',
                width: '300px'
              }}
            >
              <div className="flex items-center gap-2 text-black pr-8">
                <RiLogo />
                <span className="font-bold text-3xl">RI-HUB</span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary px-3 py-1.5 rounded-md font-semibold uppercase',
                pathname === link.href
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground'
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
