import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const welcomeBg = PlaceHolderImages.find(p => p.id === 'dashboard-welcome-bg');

  return (
    <div className="animate-in fade-in-50">
      <Card className="border-2 border-primary/20 shadow-lg relative overflow-hidden text-white">
        {welcomeBg && (
          <Image
            src={welcomeBg.imageUrl}
            alt={welcomeBg.description}
            fill
            className="object-cover"
            data-ai-hint={welcomeBg.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-headline text-primary">
              Welcome to Dashboard
            </CardTitle>
            <CardDescription className="text-lg text-white/90">
              Isbah Hassan and Associates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">
              This is your central hub for managing all aspects of your architectural projects. Use the sidebar to navigate to different sections.
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
