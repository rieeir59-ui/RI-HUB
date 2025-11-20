import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

const departments = [
  { name: 'ADMIN', employees: 5 },
  { name: 'HR', employees: 2 },
  { name: 'SOFTWARE ENGINEER', employees: 8 },
  { name: 'DRAFTMAN', employees: 4 },
  { name: '3D VISULIZER', employees: 3 },
  { name: 'ARCHITECTS', employees: 6 },
  { name: 'FINANCE', employees: 2 },
  { name: 'QUANTITY MANAGEMENT', employees: 3 },
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
            <Card key={dept.name} className="bg-sidebar border-2 border-primary/50 text-sidebar-foreground">
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
          ))}
        </div>
      </div>
    </div>
  );
}
