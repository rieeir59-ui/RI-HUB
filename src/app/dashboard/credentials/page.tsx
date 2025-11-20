
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees } from '@/lib/employees';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This is a mock hook to simulate getting the current user's role.
// In a real app, this would come from your authentication context.
const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // For demonstration, we'll simulate the role of a 'software-engineer'.
    setRole('software-engineer');
  }, []);

  return role;
};


export default function CredentialsPage() {
  const router = useRouter();
  const userRole = useUserRole();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (userRole) {
      if (userRole === 'software-engineer' || userRole === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/dashboard');
      }
    }
  }, [userRole, router]);

  if (!isAuthorized) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Verifying access...</p>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Employee Credentials</CardTitle>
        <CardDescription>List of all employee emails and passwords.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.record}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.password}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
