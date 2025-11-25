
'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const { user } = useCurrentUser();

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
        <Button asChild variant="outline">
            <Link href="/dashboard">Back to Main Dashboard</Link>
        </Button>
      </div>
      {user && (
         <div className="flex items-center gap-3">
            <span className="font-semibold text-sm hidden sm:inline-block">{user.name}</span>
             <Avatar className="h-9 w-9 border-2 border-primary">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                        src={`https://media.licdn.com/dms/image/D4D03AQFw5q0ePZz-5w/profile-displayphoto-shrink_800_800/0/1715848529321?e=1727308800&v=beta&t=H3iJqHwmyoPj91wDQD9nE0mJm2RkHnEx-ISlHhWcQ6U`}
                        alt={user.name}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            </Avatar>
        </div>
      )}
    </header>
  );
}
