'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, query, where, getDocs, orderBy, type Timestamp, FirestoreError } from 'firebase/firestore';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/context/UserContext';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


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
    const { user: currentUser } = useCurrentUser();
    const { toast } = useToast();

    const [records, setRecords] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | Error | null>(null);

    useEffect(() => {
        if (!firestore || !currentUser) {
             if (currentUser === null) {
                setIsLoading(false);
            }
            return;
        }
        
        const recordsCollection = collection(firestore, 'savedRecords');
        const q = query(
            recordsCollection,
            where('employeeId', '==', currentUser.record),
            orderBy('createdAt', 'desc')
        );

        getDocs(q)
            .then(querySnapshot => {
                const fetchedRecords = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SavedRecord));
                setRecords(fetchedRecords);
                setError(null);
            })
            .catch(serverError => {
                 const permissionError = new FirestorePermissionError({
                    path: recordsCollection.path,
                    operation: 'list'
                });
                setError(permissionError);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [firestore, currentUser, toast]);

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4">Loading your records...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Your Saved Records"
                description="Access your saved project checklists and other documents."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            {error && (
                 <Card className="text-center py-12 bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive/90">Could not fetch saved records due to a permission issue.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && records.length === 0 && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Saved Records Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You haven't saved any records yet. Go to the "Project Checklist" to save your first one.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && records.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {records.map(record => (
                        <Card key={record.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{record.projectName}</CardTitle>
                                <CardDescription>{record.fileName}</CardDescription>
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
