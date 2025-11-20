import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in-50">
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
          <p className="text-muted-foreground">
            This is your central hub for managing all aspects of your architectural projects. Use the sidebar to navigate to different sections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
