'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings,
  User,
  Briefcase,
  Users,
  Contact,
  History,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/about-me', label: 'About Me', icon: User },
  { href: '/dashboard/services', label: 'Services', icon: Briefcase },
  { href: '/dashboard/team', label: 'Our Team', icon: Users },
  { href: '/dashboard/employee', label: 'Employee', icon: Contact },
  { href: '/dashboard/login-record', label: 'Login Record', icon: History },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* The trigger is positioned absolutely, so it needs to be outside the sidebar itself */}
      <div className="absolute top-4 right-4 z-20">
        <SidebarTrigger />
      </div>
      <Sidebar side="right" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Building className="text-primary w-8 h-8" />
            <h2 className="font-headline text-2xl text-primary">RI-HUB</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    className={cn(pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground')}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
