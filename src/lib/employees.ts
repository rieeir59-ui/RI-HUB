
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
  { name: 'Isbah Hassan', contact: '123-456-7890', email: 'isbah.hassan@ri-hub.com', record: 'EMP-001', avatarId: 'avatar-1', department: 'ceo', password: 'password123' },
  { name: 'Sobia', contact: '0308-4448470', email: 'sobia@ri-hub.com', record: 'EMP-002', avatarId: 'avatar-3', department: 'admin', password: 'password123' },
  { name: 'Fiza', contact: '0306-5081954', email: 'fiza@ri-hub.com', record: 'EMP-003', avatarId: 'avatar-1', department: 'hr', password: 'password123' },
  { name: 'Rabiya Eman', contact: '03012345678', email: 'rabiya.eman@ri-hub.com', record: 'EMP-004', avatarId: 'avatar-1', department: 'software-engineer', password: 'password123' },
  { name: 'Imran Abbas', contact: '0325-5382699', email: 'imran.abbas@ri-hub.com', record: 'EMP-005', avatarId: 'avatar-2', department: 'software-engineer', password: 'password123' },
  { name: 'Waqas Rasool', contact: '0321-5564674', email: 'waqas.rasool@ri-hub.com', record: 'EMP-006', avatarId: 'avatar-2', department: 'finance', password: 'password123' },
  { name: 'Mujahid', contact: '03004741406', email: 'mujahid@ri-hub.com', record: 'EMP-007', avatarId: 'avatar-2', department: 'draftman', password: 'password123' },
  { name: 'Jabbar', contact: '0333-4624328', email: 'jabbar@ri-hub.com', record: 'EMP-008', avatarId: 'avatar-2', department: 'draftman', password: 'password123' },
  { name: 'Mohsin', contact: '123-456-7890', email: 'mohsin@ri-hub.com', record: 'EMP-009', avatarId: 'avatar-2', department: '3d-visualizer', password: 'password123' },
  { name: 'Haseeb', contact: '123-456-7890', email: 'haseeb@ri-hub.com', record: 'EMP-010', avatarId: 'avatar-2', department: 'architects', password: 'password123' },
  { name: 'Luqman', contact: '0321-1111261', email: 'luqman@ri-hub.com', record: 'EMP-011', avatarId: 'avatar-2', department: 'architects', password: 'password123' },
  { name: 'Asad', contact: '123-456-7890', email: 'asad@ri-hub.com', record: 'EMP-012', avatarId: 'avatar-2', department: 'architects', password: 'password123' },
  { name: 'Waleed', contact: '03320424458', email: 'waleed@ri-hub.com', record: 'EMP-013', avatarId: 'avatar-2', department: 'architects', password: 'password123' },
  { name: 'Kizzar', contact: '03139592679', email: 'kizzar@ri-hub.com', record: 'EMP-014', avatarId: 'avatar-2', department: 'architects', password: 'password123' },
  { name: 'Waqas', contact: '123-456-7890', email: 'waqas@ri-hub.com', record: 'EMP-015', avatarId: 'avatar-2', department: 'draftman', password: 'password123' },
  { name: 'Noman', contact: '0302-8499301', email: 'noman@ri-hub.com', record: 'EMP-016', avatarId: 'avatar-2', department: 'quantity-management', password: 'password123' },
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
