
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
} from '@/components/ui/sidebar';
import {
  LogOut,
  User,
  FileText,
  Database,
  Users,
  LayoutDashboard,
  Folder,
  Briefcase,
  Book,
  File,
  ClipboardList,
  UserCheck,
  Building,
  FilePlus,
  Compass,
  FileSearch,
  BookUser,
  FileSignature,
  FileKey,
  Scroll,
  BarChart2,
  Calendar,
  Wallet,
  CheckSquare,
  FileX,
  FilePen,
  FileUp,
  CircleDollarSign,
  Clipboard,
  Presentation,
  Package,
  ListChecks,
  Palette,
  Clock,
  BookCopy,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/context/UserContext';

const menuItems = [
    { href: '/employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employee-dashboard/our-team', label: 'Our Team', icon: Users },
    { href: '/employee-dashboard/about-me', label: 'About Me', icon: User },
    { href: '/employee-dashboard/services', label: 'Services', icon: FileText },
    { href: '/employee-dashboard/project-checklist', label: 'Project Checklist', icon: ListChecks },
    { href: '/employee-dashboard/project-information', label: 'Project Information', icon: Folder },
    { href: '/employee-dashboard/predesign-assessment', label: 'Predesign Assessment', icon: FileSearch },
    { href: '/employee-dashboard/project-data', label: 'Project Data', icon: Database },
    { href: '/employee-dashboard/project-agreement', label: 'Project Agreement', icon: FileSignature },
    { href: '/employee-dashboard/list-of-services', label: 'List of Services', icon: ClipboardList },
    { href: '/employee-dashboard/requirement-performa', label: 'Requirement Performa', icon: FilePlus },
    { href: '/employee-dashboard/site-survey', label: 'Site Survey', icon: Compass },
    { href: '/employee-dashboard/project-bylaws', label: 'Project Bylaws', icon: FileKey },
    { href: '/employee-dashboard/proposal-request', label: 'Proposal Request', icon: Briefcase },
    { href: '/employee-dashboard/drawings', label: 'Drawings', icon: Palette },
    { href: '/employee-dashboard/shop-drawings-record', label: 'Shop Drawings Record', icon: File },
    { href: '/employee-dashboard/project-chart-studio', label: 'Project Chart (Studio)', icon: BarChart2 },
    { href: '/employee-dashboard/field-reports-meetings', label: 'Field Reports/Meetings', icon: Presentation },
    { href: '/employee-dashboard/list-of-sub-consultants', label: 'List Of Sub-consultants', icon: BookUser },
    { href: '/employee-dashboard/list-of-contractors', label: 'List of Contractors', icon: Building },
    { href: '/employee-dashboard/list-of-approved-vendors', label: 'List of Approved Vendors', icon: UserCheck },
    { href: '/employee-dashboard/time-line-schedule', label: 'Time line Schedule', icon: Clock },
    { href: '/employee-dashboard/project-application-summary', label: 'Project Application Summary', icon: CheckSquare },
    { href: '/employee-dashboard/continuation-sheet', label: 'Continuation Sheet', icon: FileX },
    { href: '/employee-dashboard/construction-schedule', label: 'Construction Schedule', icon: Calendar },
    { href: '/employee-dashboard/preliminary-project-budget', label: 'Preliminary Project Budget', icon: Scroll },
    { href: '/employee-dashboard/bill-of-quantity', label: 'Bill Of Quantity', icon: Wallet },
    { href: '/employee-dashboard/rate-analysis', label: 'Rate Analysis', icon: BarChart2 },
    { href: '/employee-dashboard/change-order', label: 'Change Order', icon: Book },
    { href: '/employee-dashboard/payment-certificates', label: 'Payment Certificates', icon: CircleDollarSign },
    { href: '/employee-dashboard/instruction-sheet', label: 'Instruction Sheet', icon: FileUp },
    { href: '/employee-dashboard/other-provisions', label: 'Other Provisions', icon: BookCopy },
    { href: '/employee-dashboard/consent-of-surety', label: 'Consent of Surety', icon: FilePen },
    { href: '/employee-dashboard/substantial-summary', label: 'Substantial Summary', icon: Clipboard },
    { href: '/employee-dashboard/total-project-package', label: 'Total Project Package', icon: Package },
    { href: '/employee-dashboard/architects-instructions', label: 'Architects Instructions', icon: User },
    { href: '/employee-dashboard/construction-change-director', label: 'Construction Change Director', icon: Users },
    { href: '/employee-dashboard/document-summarizer', label: 'Document Summarizer', icon: FileText },
    { href: '/employee-dashboard/saved-records', label: 'Saved Records', icon: Database },
    { href: '/employee-dashboard/data-entry', label: 'Data Entry', icon: FileUp },
    { href: '/employee-dashboard/employee-record', label: 'Employee Record', icon: UserCog },
];


export default function EmployeeDashboardSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { logout } = useCurrentUser();

  const handleLogout = () => {
    logout();
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
