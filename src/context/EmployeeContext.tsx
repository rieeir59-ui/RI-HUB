'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { employees as initialEmployees, type Employee } from '@/lib/employees';

type EmployeeContextType = {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (record: string, updatedData: Partial<Employee>) => void;
  deleteEmployee: (record: string) => void;
  employeesByDepartment: Record<string, Employee[]>;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEmployees = localStorage.getItem('employees');
      return savedEmployees ? JSON.parse(savedEmployees) : initialEmployees;
    }
    return initialEmployees;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);


  const addEmployee = (employee: Employee) => {
    setEmployees((prevEmployees) => [...prevEmployees, employee]);
  };

  const updateEmployee = (record: string, updatedData: Partial<Employee>) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.record === record ? { ...employee, ...updatedData } : employee
      )
    );
  };

  const deleteEmployee = (record: string) => {
    setEmployees((prevEmployees) =>
      prevEmployees.filter((employee) => employee.record !== record)
    );
  };


  const employeesByDepartment = useMemo(() => {
    const grouped = employees.reduce((acc, employee) => {
        const { department } = employee;
        if (!acc[department]) {
        acc[department] = [];
        }
        acc[department].push(employee);
        return acc;
    }, {} as Record<string, Employee[]>);

    // This logic was originally in the employees.ts file.
    // It's better to have it here to react to state changes.
    if (grouped.admin) {
        const rabiya = employees.find(e => e.record === 'EMP-004');
        const imran = employees.find(e => e.record === 'EMP-005');
        if (rabiya && !grouped.admin.find(e => e.record === 'EMP-004')) grouped.admin.push(rabiya);
        if (imran && !grouped.admin.find(e => e.record === 'EMP-005')) grouped.admin.push(imran);
    }
    return grouped;

  }, [employees]);


  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee, employeesByDepartment }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
