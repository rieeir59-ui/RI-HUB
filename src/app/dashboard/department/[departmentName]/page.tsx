import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const employees = {
  admin: [
    { name: 'Isbah Hassan', contact: '123-456-7890', email: 'isbah.hassan@ri-hub.com', record: 'EMP-001', avatarId: 'avatar-1' },
    { name: 'Jane Smith', contact: '123-456-7891', email: 'jane.smith@ri-hub.com', record: 'EMP-002', avatarId: 'avatar-3' },
  ],
  hr: [
      { name: 'Ahmad Khan', contact: '123-456-7890', email: 'ahmad.khan@ri-hub.com', record: 'EMP-003', avatarId: 'avatar-2' },
  ],
  'software-engineer': [
    { name: 'Rabiya Eman', contact: '03012345678', email: 'rabiyaeman@gmail.com', record: 'EMP-004', avatarId: 'avatar-1' },
    { name: 'Imran Abbas', contact: '12343846574', email: 'imranabbas@gmail.com', record: 'EMP-005', avatarId: 'avatar-2' },
  ],
  // Add other departments and employees here
};

function formatDepartmentName(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function DepartmentPage({ params }: { params: { departmentName: string } }) {
  const { departmentName } = params;
  const departmentEmployees = employees[departmentName as keyof typeof employees] || [];
  const formattedDeptName = formatDepartmentName(departmentName);
  
  const departmentImages: {[key: string]: string} = {
    'Admin': 'https://picsum.photos/seed/admin-dept/600/400',
    'Hr': 'https://picsum.photos/seed/hr-dept/600/400',
  }
  
  const defaultImage = 'https://picsum.photos/seed/default-dept/600/400';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-headline text-primary">{formattedDeptName}</h1>

      <div className="grid gap-6">
        {departmentEmployees.map((employee) => {
          const avatar = PlaceHolderImages.find(p => p.id === employee.avatarId);
          return (
            <Card key={employee.record} className="overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                <div className="flex">
                    <div className="w-1/3 bg-primary/20 p-4 flex flex-col items-center justify-center relative">
                        {avatar && (
                            <Image
                                src={avatar.imageUrl}
                                alt={employee.name}
                                width={128}
                                height={128}
                                className="rounded-full border-4 border-card object-cover aspect-square"
                                data-ai-hint={avatar.imageHint}
                            />
                        )}
                         <p className="mt-4 text-center font-bold text-lg text-primary-foreground bg-black/50 px-2 py-1 rounded">{employee.name}</p>
                    </div>
                    <CardContent className="w-2/3 p-6 space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Contact Number</p>
                            <p className="font-semibold">{employee.contact}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold">{employee.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Record Number</p>
                            <p className="font-semibold">{employee.record}</p>
                        </div>
                    </CardContent>
                </div>
            </Card>
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
