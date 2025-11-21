
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from "react";
import { type Employee, employees } from "@/lib/employees";

// This is a mock hook to simulate getting the current logged-in user.
// In a real app, this would come from your authentication context.
const useCurrentUser = () => {
    const [user, setUser] = useState<Employee | null>(null);

    useEffect(() => {
        // For demonstration, we'll simulate the user 'Rabiya Eman'.
        const currentUser = employees.find(e => e.email === 'rabiya.eman@ri-hub.com');
        setUser(currentUser || null);
    }, []);

    return user;
};

const departments: Record<string, string> = {
    'ceo': 'CEO',
    'admin': 'Admin',
    'hr': 'HR',
    'software-engineer': 'Software Engineer',
    'draftman': 'Draftman',
    '3d-visualizer': '3D Visualizer',
    'architects': 'Architects',
    'finance': 'Finance',
    'quantity-management': 'Quantity Management',
};

function formatDepartmentName(slug: string) {
    return departments[slug] || slug;
}

export default function EmployeeDashboardPage() {
  const user = useCurrentUser();

  return (
    <Card className="bg-card/90 border-primary/30 shadow-lg">
        <CardHeader className="text-center">
          {user && (
            <>
              <CardTitle className="text-4xl font-headline text-primary font-bold">{user.name}</CardTitle>
              <CardDescription className="text-xl text-primary/90 font-semibold pt-1">Welcome to {formatDepartmentName(user.department)} Panel</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Use the sidebar to navigate to different sections of your dashboard.</p>
        </CardContent>
      </Card>
  );
}
