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
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  LogOut,
  User,
  FileText,
  Database,
  Users,
  LayoutDashboard,
  Settings,
  KeyRound,
  FileUp,
  Folder,
  Briefcase,
  Book,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const menuItems = [
    { href: '/employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employee-dashboard/our-team', label: 'Our Team', icon: Users },
    { href: '/employee-dashboard/about-me', label: 'About Me', icon: User },
    { href: '/employee-dashboard/services', label: 'Services', icon: FileText },
    { href: '/employee-dashboard/saved-records', label: 'Saved Records', icon: Database },
];

const projectManagementSubMenuItems = [
    { href: '/employee-dashboard/project-information', label: 'Project Information' },
    { href: '/employee-dashboard/project-data', label: 'Project Data' },
    { href: '/employee-dashboard/list-of-services', label: 'List of Services' },
    { href: '/employee-dashboard/list-of-sub-consultants', label: 'List Of Sub-consultants' },
    { href: '/employee-dashboard/list-of-contractors', label: 'List of Contractors' },
    { href: '/employee-dashboard/list-of-approved-vendors', label: 'List of Approved Vendors' },
];

const predesignSubMenuItems = [
    { href: '/employee-dashboard/requirement-performa', label: 'Requirement Performa' },
    { href: '/employee-dashboard/site-survey', label: 'Site Survey' },
    { href: '/employee-dashboard/predesign-assessment', label: 'Predesign Assessment' },
];

const projectExecutionSubMenuItems = [
    { href: '/employee-dashboard/project-agreement', label: 'Project Agreement' },
    { href: '/employee-dashboard/project-bylaws', label: 'Project Bylaws' },
    { href: '/employee-dashboard/preliminary-project-budget', label: 'Preliminary Project Budget' },
    { href: '/employee-dashboard/rate-analysis', label: 'Rate Analysis' },
    { href: '/employee-dashboard/bill-of-quantity', label: 'Bill Of Quantity' },
    { href: '/employee-dashboard/shop-drawings-record', label: 'Shop Drawings Record' },
    { href: '/employee-dashboard/construction-schedule', label: 'Construction Schedule' },
    { href: '/employee-dashboard/project-application-summary', label: 'Project Application Summary' },
    { href: '/employee-dashboard/continuation-sheet', label: 'Continuation Sheet' },
    { href: '/employee-dashboard/payment-certificates', label: 'Payment Certificates' },
    { href: '/employee-dashboard/substantial-summary', label: 'Substantial Summary' },
    { href: '/employee-dashboard/consent-of-surety', label: 'Consent of Surety' },
    { href: '/employee-dashboard/instruction-sheet', label: 'Instruction Sheet' },
    { href: '/employee-dashboard/proposal-request', label: 'Proposal Request' },
    { href: '/employee-dashboard/change-order', label: 'Change Order' },
    { href: '/employee-dashboard/construction-change-director', label: 'Construction Change Director' },
    { href: '/employee-dashboard/architects-instructions', label: 'Architects Instructions' },
    { href: '/employee-dashboard/field-reports-meetings', label: 'Field Reports/Meetings' },
    { href: '/employee-dashboard/document-summarizer', label: 'Document Summarizer' },
    { href: '/employee-dashboard/project-chart-studio', label: 'Project Chart (Studio)' },
    { href: '/employee-dashboard/total-project-package', label: 'Total Project Package' },
];


export default function EmployeeDashboardSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };
  
  return (
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="p-4">
            <Link href="/employee-dashboard" className="flex items-center gap-2 text-primary font-bold text-2xl font-headline">
                <Users className="w-8 h-8" />
                <span className="group-data-[collapsible=icon]:hidden">RI-HUB</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
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
