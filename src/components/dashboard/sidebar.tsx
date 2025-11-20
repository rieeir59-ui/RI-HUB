
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
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// This is a mock hook to simulate getting the current user's role.
// In a real app, this would come from your authentication context.
const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // For demonstration, we'll simulate the role of a 'software-engineer'.
    // In a real application, you would get this from the logged-in user's session.
    // We'll set it after a short delay to mimic async data fetching.
    const timer = setTimeout(() => {
        // You can change 'software-engineer' to 'hr', 'admin', etc. to test different roles.
        setRole('software-engineer'); 
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return role;
};


const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/about-me', label: 'About Me', icon: User, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/services', label: 'Services', icon: Briefcase, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/team', label: 'Our Team', icon: Users, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/employee', label: 'Employee', icon: Contact, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/login-record', label: 'Login Record', icon: History, roles: ['ceo', 'admin', 'hr', 'software-engineer', 'draftman', '3d-visualizer', 'architects', 'finance', 'quantity-management'] },
  { href: '/dashboard/credentials', label: 'Credentials', icon: KeyRound, roles: ['software-engineer', 'admin'] },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const userRole = useUserRole();

  const visibleMenuItems = menuItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <>
      {/* The trigger is positioned absolutely, so it needs to be outside the sidebar itself */}
      <div className="absolute top-4 left-4 z-20">
        <SidebarTrigger />
      </div>
      <Sidebar side="left" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Briefcase className="text-primary w-8 h-8" />
            <h2 className="font-headline text-2xl text-primary">Isbah Dashboard</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleMenuItems.map((item) => (
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
