
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, query, getDocs, orderBy, type Timestamp } from 'firebase/firestore';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/context/EmployeeContext';

// This is a mock hook to simulate getting the current user's role.
// In a real app, this would come from your authentication context.
const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // For demonstration, we'll simulate the role of 'software-engineer' which has admin-like access here.
    const timer = setTimeout(() => {
        setRole('software-engineer'); 
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return role;
};


type SavedRecordData = {
    category: string;
    items: string[];
}[];

type SavedRecord = {
    id: string;
    employeeId: string;
    employeeName: string;
    fileName: string;
    projectName: string;
    createdAt: Timestamp;
    data: SavedRecordData;
};

export default function SavedRecordsPage() {
    const image = PlaceHolderImages.find(p => p.id === 'saved-records');
    const { firestore } = useFirebase();
    const userRole = useUserRole();
    const { toast } = useToast();

    const [records, setRecords] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!firestore || !userRole) {
                setIsLoading(false);
                return;
            }
            
            // Admins see all records
            if (userRole !== 'admin' && userRole !== 'software-engineer') {
                setIsLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(firestore, 'savedRecords'),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const fetchedRecords = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SavedRecord));
                setRecords(fetchedRecords);
            } catch (error) {
                console.error("Error fetching records: ", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch saved records.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [firestore, userRole, toast]);

    const handleDownload = (record: SavedRecord) => {
        let content = `Project: ${record.projectName}\n`;
        content += `File: ${record.fileName}\n`;
        content += `Saved by: ${record.employeeName}\n`;
        content += `Date: ${record.createdAt.toDate().toLocaleDateString()}\n\n`;

        record.data.forEach(section => {
            content += `${section.category}\n`;
            section.items.forEach(item => {
                content += `- ${item}\n`;
            });
            content += '\n';
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.projectName.replace(/\s+/g, '_')}_${record.fileName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (userRole === null) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Verifying access...</span>
            </div>
        )
    }

    if (userRole !== 'admin' && userRole !== 'software-engineer') {
        return (
             <div className="space-y-8">
                <DashboardPageHeader
                    title="Saved Records"
                    description="Access all saved project checklists and documents."
                    imageUrl={image?.imageUrl || ''}
                    imageHint={image?.imageHint || ''}
                />
                 <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="All Saved Records"
                description="Access all saved project checklists and documents from all employees."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-4">Loading records...</span>
                </div>
            )}

            {!isLoading && records.length === 0 && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Saved Records Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No employees have saved any records yet.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && records.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {records.map(record => (
                        <Card key={record.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{record.projectName}</CardTitle>
                                <CardDescription>Saved by: {record.employeeName}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    Saved on: {record.createdAt.toDate().toLocaleDateString()}
                                </div>
                                <div className="space-y-2">
                                  {record.data.slice(0, 2).map((section, index) => (
                                    <div key={index}>
                                      <h4 className="font-semibold">{section.category}</h4>
                                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {section.items.slice(0, 3).map((item, itemIndex) => (
                                          <li key={itemIndex}>{item}</li>
                                        ))}
                                         {section.items.length > 3 && <li>...and more</li>}
                                      </ul>
                                    </div>
                                  ))}
                                   {record.data.length > 2 && <p className="text-sm text-muted-foreground">...and more categories</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handleDownload(record)} className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Record
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
