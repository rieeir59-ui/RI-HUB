
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Building, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEmployees } from '@/context/EmployeeContext';


const departments = [
    { name: 'CEO', slug: 'ceo' },
    { name: 'ADMIN', slug: 'admin' },
    { name: 'HR', slug: 'hr' },
    { name: 'SOFTWARE ENGINEER', slug: 'software-engineer' },
    { name: 'DRAFTMAN', slug: 'draftman' },
    { name: '3D VISULIZER', slug: '3d-visualizer' },
    { name: 'ARCHITECTS', slug: 'architects' },
    { name: 'FINANCE', slug: 'finance' },
    { name: 'QUANTITY MANAGEMENT', slug: 'quantity-management' },
];

export default function DashboardPage() {
    const { employees, employeesByDepartment } = useEmployees();
    const [departmentCounts, setDepartmentCounts] = useState<Record<string, number>>({});
    const recentHires = employees.slice(-3);

    useEffect(() => {
        const counts: Record<string, number> = {};
        for (const dept of departments) {
            counts[dept.slug] = employeesByDepartment[dept.slug as keyof typeof employeesByDepartment]?.length || 0;
        }
        setDepartmentCounts(counts);
    }, [employeesByDepartment]);


  return (
    <div className="animate-in fade-in-50 space-y-8">
      <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold">Analytics Overview</h2>
             <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{departments.length}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                          {recentHires.map((employee) => (
                            <div key={employee.record} className="text-sm text-muted-foreground">
                              {employee.name}
                            </div>
                          ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
      </div>
      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">DEPARTMENTS</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments.map((dept) => (
            <Link href={`/dashboard/department/${dept.slug}`} key={dept.name}>
                <Card className="bg-sidebar text-sidebar-foreground border-2 border-primary/80 shadow-[0_0_15px_3px_hsl(var(--primary)/0.4)] h-full transition-transform hover:scale-105 hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.5)] cursor-pointer">
                <CardHeader>
                    <CardTitle className="text-primary font-bold uppercase">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 text-sidebar-foreground/80">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{departmentCounts[dept.slug] || 0} Employees</span>
                    </div>
                </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
