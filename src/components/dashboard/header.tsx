'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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


export function Header() {
  const user = useCurrentUser();

  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* You can add a title here if needed */}
      </div>
      {user && (
         <div className="flex items-center gap-3">
            <span className="font-semibold text-sm hidden sm:inline-block">{user.name}</span>
            <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
        </div>
      )}
    </header>
  );
}
