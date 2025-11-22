'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, query, where, getDocs, orderBy, type Timestamp, onSnapshot, FirestoreError } from 'firebase/firestore';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Edit } from 'lucide-react';
import { useCurrentUser } from '@/context/UserContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { getFormUrlFromFileName } from '@/lib/utils';

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
    const { user: currentUser, isUserLoading } = useCurrentUser();

    const [records, setRecords] = useState<SavedRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        if (isUserLoading) {
            setIsLoading(true);
            return;
        }

        if (!firestore) {
            setIsLoading(false);
            setError("Firestore is not available.");
            return;
        }
        
        if (!currentUser) {
            setIsLoading(false);
            setError("You must be logged in to view your records.");
            return;
        }

        const recordsCollection = collection(firestore, 'savedRecords');
        const q = query(
            recordsCollection,
            where('employeeId', '==', currentUser.record),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const fetchedRecords = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SavedRecord));
                setRecords(fetchedRecords);
                setError(null);
                setIsLoading(false);
            },
            (serverError: FirestoreError) => {
                console.error("Firestore Error:", serverError);
                const permissionError = new FirestorePermissionError({
                    path: `savedRecords`, // This path is simplified.
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                setError(permissionError.message);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, currentUser, isUserLoading]);

    const handleDownload = (record: SavedRecord) => {
        let content = `Project: ${record.projectName}\n`;
        content += `File: ${record.fileName}\n`;
        content += `Saved by: ${record.employeeName}\n`;
        content += `Date: ${record.createdAt.toDate().toLocaleDateString()}\n\n`;

        record.data.forEach(section => {
            content += `${section.category}\n`;
            section.items.forEach(item => {
                try {
                  const parsedItem = JSON.parse(item);
                  Object.entries(parsedItem).forEach(([key, value]) => {
                    content += `- ${key}: ${value}\n`;
                  });
                } catch (e) {
                  content += `- ${item}\n`;
                }
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
                        <p className="text-destructive/90">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && records.length === 0 && (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>No Saved Records Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You haven't saved any records yet. Save a document from another page to see it here.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && records.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {records.map(record => {
                        const formUrl = getFormUrlFromFileName(record.fileName, 'employee-dashboard');
                        return (
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
                                        {section.items.slice(0, 3).map((item, itemIndex) => {
                                           try {
                                                const parsedItem = JSON.parse(item);
                                                return Object.entries(parsedItem).slice(0,1).map(([key, value]) => (
                                                    <li key={`${itemIndex}-${key}`}>{`${key}: ${String(value).substring(0,20)}...`}</li>
                                                ));
                                            } catch(e) {
                                                return <li key={itemIndex}>{String(item).substring(0,30)}...</li>
                                            }
                                        })}
                                         {section.items.length > 3 && <li>...and more</li>}
                                      </ul>
                                    </div>
                                  ))}
                                   {record.data.length > 2 && <p className="text-sm text-muted-foreground">...and more categories</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch space-y-2">
                                {formUrl && (
                                     <Button asChild>
                                        <Link href={`${formUrl}?id=${record.id}`}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Record
                                        </Link>
                                    </Button>
                                )}
                                <Button onClick={() => handleDownload(record)} variant="outline" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Raw Data
                                </Button>
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            )}
        </div>
    );
}
