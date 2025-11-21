
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import EmployeeDashboardSidebar from "@/components/employee-dashboard/sidebar";
import { Header } from "@/components/employee-dashboard/header";
import { EmployeeProvider } from "@/context/EmployeeContext";
import WelcomePanel from "@/components/employee-dashboard/WelcomePanel";

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeProvider>
      <SidebarProvider>
        <EmployeeDashboardSidebar />
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
