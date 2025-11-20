import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';

const departments = [
  { name: 'CEO', employees: 1, href: '/dashboard/department/ceo' },
  { name: 'ADMIN', employees: 4, href: '/dashboard/department/admin' },
  { name: 'HR', employees: 2, href: '/dashboard/department/hr' },
  { name: 'SOFTWARE ENGINEER', employees: 2, href: '/dashboard/department/software-engineer' },
  { name: 'DRAFTMAN', employees: 3, href: '/dashboard/department/draftman' },
  { name: '3D VISULIZER', employees: 1, href: '/dashboard/department/3d-visualizer' },
  { name: 'ARCHITECTS', employees: 5, href: '/dashboard/department/architects' },
  { name: 'FINANCE', employees: 1, href: '/dashboard/department/finance' },
  { name: 'QUANTITY MANAGEMENT', employees: 1, href: '/dashboard/department/quantity-management' },
];

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in-50 space-y-8">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
            Welcome to Dashboard
          </CardTitle>
          <CardDescription className="text-lg">
            Isbah Hassan and Associates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is your central hub for managing all aspects of your architectural projects. Use the sidebar to navigate to different sections.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">Departments</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments.map((dept) => (
            <Link href={dept.href} key={dept.name}>
                <Card className="bg-sidebar text-sidebar-foreground border-2 border-primary/80 shadow-[0_0_15px_3px_hsl(var(--primary)/0.4)] h-full">
                <CardHeader>
                    <CardTitle className="text-primary font-bold">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 text-sidebar-foreground/80">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{dept.employees} Employees</span>
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
