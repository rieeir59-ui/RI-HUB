'use client';
import { useEffect, useState } from "react";
import { type Employee, employees } from "@/lib/employees";

// This is a mock hook to simulate getting the current logged-in user.
// In a real app, this would come from your authentication context.
const useCurrentUser = () => {
    const [user, setUser] = useState<Employee | null>(null);

    useEffect(() => {
        // For demonstration, we'll simulate the user 'Rabiya Eman'.
        const currentUser = employees.find(e => e.email === 'rabiya.eman@ri-hub.com');
        setUser(currentUser || null);
    }, []);

    return user;
};

const departments: Record<string, string> = {
    'ceo': 'CEO',
    'admin': 'Admin',
    'hr': 'HR',
    'software-engineer': 'Software Engineer',
    'draftman': 'Draftman',
    '3d-visualizer': '3D Visualizer',
    'architects': 'Architects',
    'finance': 'Finance',
    'quantity-management': 'Quantity Management',
};

function formatDepartmentName(slug: string) {
    return departments[slug] || slug;
}


export default function WelcomePanel() {
    const user = useCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <div className="bg-muted px-4 py-2 text-sm text-muted-foreground border-b md:px-6">
            Welcome to {formatDepartmentName(user.department)} Panel
        </div>
    )
}
