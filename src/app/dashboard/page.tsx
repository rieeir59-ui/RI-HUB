import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

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
          <Card className="bg-muted border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-bold">ADMIN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span className="font-semibold">5 Employees</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
