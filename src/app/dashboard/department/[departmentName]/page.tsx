import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const employees = {
  admin: [
    { name: 'Isbah Hassan', contact: '123-456-7890', email: 'isbah.hassan@ri-hub.com', record: 'EMP-001', avatarId: 'avatar-1' },
    { name: 'Sobia', contact: '123-456-7890', email: 'sobia@ri-hub.com', record: 'EMP-002', avatarId: 'avatar-3' },
  ],
  hr: [
      { name: 'Fiza', contact: '123-456-7890', email: 'fiza@ri-hub.com', record: 'EMP-003', avatarId: 'avatar-1' },
      { name: 'Sobia', contact: '123-456-7890', email: 'sobia@ri-hub.com', record: 'EMP-002', avatarId: 'avatar-3' },
  ],
  'software-engineer': [
    { name: 'Rabiya Eman', contact: '03012345678', email: 'rabiyaeman@gmail.com', record: 'EMP-004', avatarId: 'avatar-1' },
    { name: 'Imran Abbas', contact: '12343846574', email: 'imranabbas@gmail.com', record: 'EMP-005', avatarId: 'avatar-2' },
  ],
  draftman: [
    { name: 'Waqas', contact: '123-456-7890', email: 'waqas@ri-hub.com', record: 'EMP-006', avatarId: 'avatar-2' },
    { name: 'Mujahid', contact: '123-456-7890', email: 'mujahid@ri-hub.com', record: 'EMP-007', avatarId: 'avatar-2' },
    { name: 'Jabbar', contact: '123-456-7890', email: 'jabbar@ri-hub.com', record: 'EMP-008', avatarId: 'avatar-2' },
  ],
  '3d-visualizer': [
      { name: 'Mosin', contact: '123-456-7890', email: 'mosin@ri-hub.com', record: 'EMP-009', avatarId: 'avatar-2' },
  ],
  architects: [
      { name: 'Hareeb', contact: '123-456-7890', email: 'hareeb@ri-hub.com', record: 'EMP-010', avatarId: 'avatar-2' },
      { name: 'Loaman', contact: '123-456-7890', email: 'loaman@ri-hub.com', record: 'EMP-011', avatarId: 'avatar-2' },
      { name: 'Asad', contact: '123-456-7890', email: 'asad@ri-hub.com', record: 'EMP-012', avatarId: 'avatar-2' },
      { name: 'Wakeel', contact: '123-456-7890', email: 'wakeel@ri-hub.com', record: 'EMP-013', avatarId: 'avatar-2' },
      { name: 'Kizzar', contact: '123-456-7890', email: 'kizzar@ri-hub.com', record: 'EMP-014', avatarId: 'avatar-2' },
  ],
  finance: [
      { name: 'Waqar', contact: '123-456-7890', email: 'waqar@ri-hub.com', record: 'EMP-015', avatarId: 'avatar-2' },
  ],
  'quantity-management': [
      { name: 'Noman', contact: '123-456-7890', email: 'noman@ri-hub.com', record: 'EMP-016', avatarId: 'avatar-2' },
  ],
};

function formatDepartmentName(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getInitials(name: string) {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
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
          const initials = getInitials(employee.name);
          return (
            <Card key={employee.record} className="overflow-hidden shadow-lg transition-transform hover:scale-[1.02] border-primary/50">
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
