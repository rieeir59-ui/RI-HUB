
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiIdLogo } from '@/components/layout/header';

export default function LoginPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546349851-64285be8e9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzYzNTczMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080')"}} />
      <Card className="w-full max-w-md shadow-2xl border-primary/30 z-10 animate-in fade-in-50 slide-in-from-bottom-10">
        <CardHeader className="items-center text-center">
            <RiIdLogo />
          <CardTitle className="text-2xl font-headline text-primary">RI-HUB Management System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">Login functionality has been removed.</p>
            <Link href="/" className="text-primary hover:underline">
                Go back to Home
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
