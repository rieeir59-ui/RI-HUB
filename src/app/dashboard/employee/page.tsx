import Image from 'next/image';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const employees = [
  {
    name: 'Isbah Hassan',
    email: 'isbah.hassan@ri-hub.com',
    role: 'Principal Architect',
    status: 'Active',
    avatarId: 'avatar-1',
  },
  {
    name: 'Ahmad Khan',
    email: 'ahmad.khan@ri-hub.com',
    role: 'Project Manager',
    status: 'Active',
    avatarId: 'avatar-2',
  },
  {
    name: 'Fatima Ali',
    email: 'fatima.ali@ri-hub.com',
    role: 'Junior Architect',
    status: 'On Leave',
    avatarId: 'avatar-3',
  },
];

export default function EmployeePage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Employees</CardTitle>
            <CardDescription>Manage your company's employee records.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const avatar = PlaceHolderImages.find(p => p.id === employee.avatarId);
              return (
                <TableRow key={employee.email}>
                  <TableCell className="hidden sm:table-cell">
                    {avatar && (
                       <Image
                        alt="Employee avatar"
                        className="aspect-square rounded-full object-cover"
                        height="64"
                        src={avatar.imageUrl}
                        width="64"
                        data-ai-hint={avatar.imageHint}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="font-bold">{employee.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{employee.email}</div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-600' : ''}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-3</strong> of <strong>3</strong> employees
        </div>
        <div className="ml-auto">
          <Button size="sm" variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
