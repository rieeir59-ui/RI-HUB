import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function EmployeeDashboardPage() {
  return (
    <Card className="bg-card/90 border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Welcome to Your Dashboard</CardTitle>
          <CardDescription className="text-lg">This is your personal space.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Use the sidebar to navigate to different sections.</p>
        </CardContent>
      </Card>
  );
}
