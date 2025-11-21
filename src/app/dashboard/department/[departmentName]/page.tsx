'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useEmployees } from '@/context/EmployeeContext';
import { useParams } from 'next/navigation';

function formatDepartmentName(slug: string) {
  if (!slug) return '';
  if (slug.toLowerCase() === 'ceo') return 'CEO';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getInitials(name: string) {
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
}


export default function DepartmentPage() {
  const params = useParams();
  const { employeesByDepartment } = useEmployees();
  const departmentName = Array.isArray(params.departmentName) ? params.departmentName[0] : params.departmentName;
  const departmentEmployees = employeesByDepartment[departmentName as keyof typeof employeesByDepartment] || [];
  const formattedDeptName = formatDepartmentName(departmentName);
  
  const departmentImages: {[key: string]: string} = {
    'Admin': 'https://picsum.photos/seed/admin-dept/600/400',
    'Hr': 'https://picsum.photos/seed/hr-dept/600/400',
  }
  
  const defaultImage = 'https://picsum.photos/seed/default-dept/600/400';

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-headline text-primary">{formattedDeptName}</h1>
        </div>
      </div>

      <div className="grid gap-6">
        {departmentEmployees.map((employee) => {
          const initials = getInitials(employee.name);
          return (
            <Link href="/login" key={employee.record}>
              <Card className="overflow-hidden shadow-lg transition-transform hover:scale-[1.02] border-primary/50 relative cursor-pointer">
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex">
                      <div className="w-1/3 bg-secondary p-4 flex flex-col items-center justify-center relative">
                          <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center border-4 border-primary/50 shadow-inner">
                              <span className="text-5xl font-bold text-primary">{initials}</span>
                          </div>
                           <p className="mt-4 text-center font-bold text-xl text-secondary-foreground">{employee.name}</p>
                      </div>
                      <CardContent className="w-2/3 p-6 space-y-4 bg-card/50">
                          <div>
                              <p className="text-sm text-muted-foreground">Contact Number</p>
                              <p className="font-semibold text-lg">{employee.contact}</p>
                          </div>
                           <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-semibold text-lg">{employee.email}</p>
                          </div>
                          <div>
                              <p className="text-sm text-muted-foreground">Record Number</p>
                              <p className="font-semibold text-lg">{employee.record}</p>
                          </div>
                      </CardContent>
                  </div>
              </Card>
            </Link>
          );
        })}
      </div>
       {departmentEmployees.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No employees found for this department.</p>
          </div>
      )}
    </div>
  );
}
