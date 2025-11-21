
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RiIdLogo } from '@/components/layout/header';
import { employees } from '@/lib/employees';
import { useCurrentUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === password);

    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
      return;
    }
    
    login(user);
    
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    
    router.push('/employee-dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1546349851-64285be8e9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzYzNTczMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080')"}} />
      <Card className="w-full max-w-md shadow-2xl border-primary/30 z-10 animate-in fade-in-50 slide-in-from-bottom-10">
        <CardHeader className="items-center text-center">
            <RiIdLogo />
          <CardTitle className="text-2xl font-headline text-primary">RI-HUB Management System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="email"
              placeholder="employee@ri-hub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <Button onClick={handleLogin} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Sign In
             </Button>
             <Button variant="link" asChild className="flex-1 text-primary hover:underline p-0">
                <Link href="#">Forgot Password?</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
