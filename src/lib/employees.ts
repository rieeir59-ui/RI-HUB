
export type Employee = {
  name: string;
  contact: string;
  email: string;
  record: string;
  avatarId: string;
  department: string;
  password?: string;
};

export const employees: Employee[] = [
  { name: 'Isbah Hassan', contact: '123-456-7890', email: 'isbah.hassan@ri-hub.com', record: 'EMP-001', avatarId: 'avatar-1', department: 'ceo', password: 'password@1' },
  { name: 'Sobia', contact: '123-456-7890', email: 'sobia@ri-hub.com', record: 'EMP-002', avatarId: 'avatar-3', department: 'admin', password: 'password@2' },
  { name: 'Fiza', contact: '123-456-7890', email: 'fiza@ri-hub.com', record: 'EMP-003', avatarId: 'avatar-1', department: 'hr', password: 'password@3' },
  { name: 'Rabiya Eman', contact: '03012345678', email: 'rabiya.eman@ri-hub.com', record: 'EMP-004', avatarId: 'avatar-1', department: 'software-engineer', password: 'password@4' },
  { name: 'Imran Abbas', contact: '12343846574', email: 'imran.abbas@ri-hub.com', record: 'EMP-005', avatarId: 'avatar-2', department: 'software-engineer', password: 'password@5' },
  { name: 'Waqar', contact: '123-456-7890', email: 'waqar@ri-hub.com', record: 'EMP-006', avatarId: 'avatar-2', department: 'finance', password: 'password@6' },
  { name: 'Mujahid', contact: '123-456-7890', email: 'mujahid@ri-hub.com', record: 'EMP-007', avatarId: 'avatar-2', department: 'draftman', password: 'password@7' },
  { name: 'Jabbar', contact: '123-456-7890', email: 'jabbar@ri-hub.com', record: 'EMP-008', avatarId: 'avatar-2', department: 'draftman', password: 'password@8' },
  { name: 'Mosin', contact: '123-456-7890', email: 'mosin@ri-hub.com', record: 'EMP-009', avatarId: 'avatar-2', department: '3d-visualizer', password: 'password@9' },
  { name: 'Haseeb', contact: '123-456-7890', email: 'haseeb@ri-hub.com', record: 'EMP-010', avatarId: 'avatar-2', department: 'architects', password: 'password@10' },
  { name: 'Luqman', contact: '123-456-7890', email: 'luqman@ri-hub.com', record: 'EMP-011', avatarId: 'avatar-2', department: 'architects', password: 'password@11' },
  { name: 'Asad', contact: '123-456-7890', email: 'asad@ri-hub.com', record: 'EMP-012', avatarId: 'avatar-2', department: 'architects', password: 'password@12' },
  { name: 'Waleed', contact: '123-456-7890', email: 'waleed@ri-hub.com', record: 'EMP-013', avatarId: 'avatar-2', department: 'architects', password: 'password@13' },
  { name: 'Kizzar', contact: '123-456-7890', email: 'kizzar@ri-hub.com', record: 'EMP-014', avatarId: 'avatar-2', department: 'architects', password: 'password@14' },
  { name: 'Waqas', contact: '123-456-7890', email: 'waqas@ri-hub.com', record: 'EMP-015', avatarId: 'avatar-2', department: 'draftman', password: 'password@15' },
  { name: 'Noman', contact: '123-456-7890', email: 'noman@ri-hub.com', record: 'EMP-016', avatarId: 'avatar-2', department: 'quantity-management', password: 'password@16' },
];

export const employeesByDepartment = employees.reduce((acc, employee) => {
  const { department } = employee;
  if (!acc[department]) {
    acc[department] = [];
  }
  acc[department].push(employee);
  return acc;
}, {} as Record<string, Employee[]>);

// Add admin employees
if (employeesByDepartment.admin) {
    const rabiya = employees.find(e => e.record === 'EMP-004');
    const imran = employees.find(e => e.record === 'EMP-005');
    if (rabiya) employeesByDepartment.admin.push(rabiya);
    if (imran) employeesByDepartment.admin.push(imran);
}
