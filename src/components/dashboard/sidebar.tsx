
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
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  LogOut,
  KeyRound,
  FileText,
  Database,
  FileUp,
  Folder,
  Briefcase,
  Book,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// This is a mock hook to simulate getting the current user's role.
// In a real app, this would come from your authentication context.
const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // For demonstration, we'll simulate the role of a 'software-engineer'
    // after a short delay to mimic async fetching.
    const timer = setTimeout(() => {
        setRole('software-engineer'); 
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return role;
};


const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/employee', label: 'Employees', icon: Users },
    { href: '/dashboard/team', label: 'Our Team', icon: User },
    { href: '/dashboard/about-me', label: 'About Me', icon: User },
    { href: 'src/app/dashboard/services', label: 'Services', icon: FileText },
    { href: '/dashboard/data-entry', label: 'Data Entry', icon: FileUp, roles: ['admin'] },
    { href: '/dashboard/saved-records', label: 'Saved Records', icon: Database, roles: ['admin', 'software-engineer'] },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['software-engineer', 'admin'] },
    { href: '/dashboard/credentials', label: 'Credentials', icon: KeyRound, roles: ['software-engineer', 'admin'] },
  ];

const projectManagementSubMenuItems = [
    { href: '/dashboard/project-information', label: 'Project Information' },
    { href: '/dashboard/project-data', label: 'Project Data' },
    { href: '/dashboard/list-of-services', label: 'List of Services' },
    { href: '/dashboard/list-of-sub-consultants', label: 'List Of Sub-consultants' },
    { href: '/dashboard/list-of-contractors', label: 'List of Contractors' },
    { href: '/dashboard/list-of-approved-vendors', label: 'List of Approved Vendors' },
];

const predesignSubMenuItems = [
    { href: '/dashboard/requirement-performa', label: 'Requirement Performa' },
    { href: '/dashboard/site-survey', label: 'Site Survey' },
    { href: '/dashboard/predesign-assessment', label: 'Predesign Assessment' },
];

const projectExecutionSubMenuItems = [
    { href: '/dashboard/project-agreement', label: 'Project Agreement' },
    { href: '/dashboard/project-bylaws', label: 'Project Bylaws' },
    { href: '/dashboard/preliminary-project-budget', label: 'Preliminary Project Budget' },
    { href: '/dashboard/rate-analysis', label: 'Rate Analysis' },
    { href: '/dashboard/bill-of-quantity', label: 'Bill Of Quantity' },
    { href: '/dashboard/shop-drawings-record', label: 'Shop Drawings Record' },
    { href: '/dashboard/construction-schedule', label: 'Construction Schedule' },
    { href: '/dashboard/project-application-summary', label: 'Project Application Summary' },
    { href: '/dashboard/continuation-sheet', label: 'Continuation Sheet' },
    { href: '/dashboard/payment-certificates', label: 'Payment Certificates' },
    { href: '/dashboard/substantial-summary', label: 'Substantial Summary' },
    { href: '/dashboard/consent-of-surety', label: 'Consent of Surety' },
    { href: '/dashboard/instruction-sheet', label: 'Instruction Sheet' },
    { href: '/dashboard/proposal-request', label: 'Proposal Request' },
    { href: '/dashboard/change-order', label: 'Change Order' },
    { href: '/dashboard/construction-change-director', label: 'Construction Change Director' },
    { href: '/dashboard/architects-instructions', label: 'Architects Instructions' },
    { href: '/dashboard/field-reports-meetings', label: 'Field Reports/Meetings' },
    { href: '/dashboard/document-summarizer', label: 'Document Summarizer' },
    { href: '/dashboard/project-chart-studio', label: 'Project Chart (Studio)' },
    { href: '/dashboard/total-project-package', label: 'Total Project Package' },
];


export default function DashboardSidebar() {
  const pathname = usePathname();
  const userRole = useUserRole();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    // if a role is available, check if the user has one of the required roles
    return userRole && item.roles.includes(userRole);
  });
  
  return (
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-2xl font-headline">
                <Users className="w-8 h-8" />
                <span className="group-data-[collapsible=icon]:hidden">RI-HUB</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {visibleMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        className={cn(pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground', 'group-data-[collapsible=icon]:justify-center')}
                        tooltip={item.label}
                    >
                        <item.icon className="size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  className={'group-data-[collapsible=icon]:justify-center'}
                  tooltip={'Project Management'}
                >
                  <Folder className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Project Management
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {projectManagementSubMenuItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <Link href={subItem.href} passHref>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                        >
                          {subItem.label}
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  className={'group-data-[collapsible=icon]:justify-center'}
                  tooltip={'Predesign'}
                >
                  <Briefcase className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Predesign
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {predesignSubMenuItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <Link href={subItem.href} passHref>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                        >
                          {subItem.label}
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuButton
                  className={'group-data-[collapsible=icon]:justify-center'}
                  tooltip={'Project Execution'}
                >
                  <Book className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Project Execution
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {projectExecutionSubMenuItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <Link href={subItem.href} passHref>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                        >
                          {subItem.label}
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <SidebarSeparator />
            <SidebarMenu>
                <SidebarMenuItem>
                     <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
                        <LogOut className="size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  );
}
