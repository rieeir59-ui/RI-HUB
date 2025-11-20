'use client';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Header() {
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar-1');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* You can add a title here if needed */}
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
            {avatar && <AvatarImage src={avatar.imageUrl} alt="User avatar" />}
            <AvatarFallback>IH</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
