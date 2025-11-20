
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarSeparator,
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
  FileCheck,
  FileText,
  FileQuestion,
  Database,
  FileUp,
  FileJson,
  Book,
  FileBarChart2,
  Users2,
  List,
  Clock,
  FileSpreadsheet,
  Sheet,
  Scale,
  FileKey2,
  FileSignature,
  FilePlus2,
  FileCheck2,
  LogOut,
  Folder,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        setRole('software-engineer'); 
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return role;
};

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'Project Checklist',
      icon: FileCheck,
      subItems: [
        { href: '/dashboard/project-information', label: 'Project Information' },
        { href: '/dashboard/predesign-assessment', label: 'Predesign Assessment' },
        { href: '/dashboard/project-data', label: 'Project Data' },
        { href: '/dashboard/project-agreement', label: 'Project Agreement' },
        { href: '/dashboard/list-of-services', label: 'List of Services' },
        { href: '/dashboard/requirement-performa', label: 'Requirement Performa' },
        { href: '/dashboard/site-survey', label: 'Site Survey' },
        { href: '/dashboard/project-bylaws', label: 'Project Bylaws' },
        { href: '/dashboard/proposal-request', label: 'Proposal Request' },
      ],
    },
    {
      label: 'Drawings',
      icon: Folder,
      subItems: [
        { href: '/dashboard/shop-drawings-record', label: 'Shop Drawings Record' },
        { href: '/dashboard/project-chart-studio', label: 'Project Chart (Studio)' },
      ],
    },
    {
      label: 'Field Reports/Meetings',
      icon: FileText,
      subItems: [
        { href: '/dashboard/field-reports-meetings', label: 'Field Reports/Meetings' },
        { href: '/dashboard/list-of-sub-consultants', label: 'List Of Sub-consultants' },
        { href: '/dashboard/list-of-contractors', label: 'List of Contractors' },
        { href: '/dashboard/list-of-approved-vendors', label: 'List of Approved Vendors' },
      ],
    },
    {
      label: 'Time line Schedule',
      icon: Clock,
      subItems: [
        { href: '/dashboard/project-application-summary', label: 'Project Application Summary' },
        { href: '/dashboard/continuation-sheet', label: 'Continuation Sheet' },
        { href: '/dashboard/construction-schedule', label: 'Construction Schedule' },
      ],
    },
    {
      label: 'Bill Of Quantity',
      icon: FileSpreadsheet,
      subItems: [
        { href: '/dashboard/preliminary-project-budget', label: 'Preliminary Project Budget' },
        { href: '/dashboard/bill-of-quantity', label: 'Bill Of Quantity' },
        { href: '/dashboard/rate-analysis', label: 'Rate Analysis' },
      ],
    },
    {
      label: 'Change Order',
      icon: FileKey2,
      subItems: [
        { href: '/dashboard/change-order', label: 'Change Order' },
        { href: '/dashboard/payment-certificates', label: 'Payment Certificates' },
      ],
    },
    {
      label: 'Other Provisions',
      icon: FilePlus2,
      subItems: [
        { href: '/dashboard/instruction-sheet', label: 'Instruction Sheet' },
        { href: '/dashboard/consent-of-surety', label: 'Consent of Surety' },
        { href: '/dashboard/substantial-summary', label: 'Substantial Summary' },
        { href: '/dashboard/total-project-package', label: 'Total Project Package' },
        { href: '/dashboard/architects-instructions', label: 'Architects Instructions' },
        { href: '/dashboard/construction-change-director', label: 'Construction Change Director' },
      ],
    },
    { href: '/dashboard/document-summarizer', label: 'Document Summarizer', icon: FileJson },
    { href: '/dashboard/saved-records', label: 'Saved Records', icon: Database },
    { href: '/dashboard/data-entry', label: 'Data Entry', icon: FileUp },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/credentials', label: 'Credentials', icon: KeyRound, roles: ['software-engineer', 'admin'] },
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
    return userRole && item.roles.includes(userRole);
  });
  
  return (
    <>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-2xl font-headline">
                <Briefcase className="w-8 h-8" />
                <span className="group-data-[collapsible=icon]:hidden">Project Hub</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <div className="relative mb-2 group-data-[collapsible=icon]:hidden px-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    placeholder="Search documents..."
                    className="w-full pl-8 pr-2 py-1.5 text-sm bg-sidebar-accent border border-sidebar-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
          <SidebarMenu>
            {visibleMenuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                {item.subItems ? (
                    <SidebarGroup>
                        <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                            <item.icon className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                            <SidebarMenuSubButton key={subItem.href} asChild isActive={pathname === subItem.href}>
                                <Link href={subItem.href}>{subItem.label}</Link>
                            </SidebarMenuSubButton>
                        ))}
                        </SidebarMenuSub>
                    </SidebarGroup>
                ) : (
                    <Link href={item.href || '#'} passHref>
                        <SidebarMenuButton
                            isActive={pathname === item.href}
                            className={cn(pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground', 'group-data-[collapsible=icon]:justify-center')}
                            tooltip={item.label}
                        >
                            <item.icon className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                )}
              </SidebarMenuItem>
            ))}
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
    </>