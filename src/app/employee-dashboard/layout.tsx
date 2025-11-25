'use client';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import EmployeeDashboardSidebar from "@/components/employee-dashboard/sidebar";
import { Header } from "@/components/employee-dashboard/header";
import { EmployeeProvider } from "@/context/EmployeeContext";

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeProvider>
      <SidebarProvider>
        <div className="flex">
            <EmployeeDashboardSidebar />
            <main className="flex-1">
                <Header />
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
      </SidebarProvider>
    </EmployeeProvider>
  );
}
