
'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { EmployeeProvider } from "@/context/EmployeeContext";
import WelcomePanel from "@/components/dashboard/WelcomePanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <Header />
          <WelcomePanel />
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </EmployeeProvider>
  );
}

