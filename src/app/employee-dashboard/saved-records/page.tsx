'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase/provider';
import { collection, query, where, getDocs, orderBy, type Timestamp, onSnapshot, FirestoreError, doc, deleteDoc } from 'firebase/firestore';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCurrentUser } from '@/context/UserContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { getFormUrlFromFileName } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
    const [recordToDelete, setRecordToDelete] = useState<SavedRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(record.projectName, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`File: ${record.fileName}`, 14, yPos);
        yPos += 7;
        doc.text(`Saved by: ${record.employeeName}`, 14, yPos);
        yPos += 7;
        doc.text(`Date: ${record.createdAt.toDate().toLocaleDateString()}`, 14, yPos);
        yPos += 10;

        record.data.forEach(section => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(section.category, 14, yPos);
            yPos += 10;

            const body = section.items.map(item => {
                try {
                    const parsed = JSON.parse(item);
                    return Object.entries(parsed).map(([key, value]) => [key, String(value)]);
                } catch {
                    const parts = item.split(':');
                    if (parts.length > 1) {
                        return [parts[0], parts.slice(1).join(':').trim()];
                    }
                    return [item, ''];
                }
            }).flat();

            (doc as any).autoTable({
                startY: yPos,
                body: body,
                theme: 'plain',
                styles: { fontSize: 9 }
            });

            yPos = (doc as any).autoTable.previous.finalY + 10;
        });

        doc.save(`${record.projectName.replace(/\s+/g, '_')}_${record.fileName.replace(/\s+/g, '_')}.pdf`);
    };

    const openDeleteDialog = (record: SavedRecord) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete || !firestore) return;

        const docRef = doc(firestore, 'savedRecords', recordToDelete.id);
        try {
            await deleteDoc(docRef);
            // The onSnapshot listener will automatically update the UI
        } catch (serverError) {
            console.error("Error deleting document:", serverError);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
        }
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
        <>
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
                                    <div className="flex gap-2">
                                        {formUrl && (
                                            <Button asChild className="flex-1">
                                                <Link href={`${formUrl}?id=${record.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                        )}
                                        <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(record)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button onClick={() => handleDownload(record)} variant="outline" className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </CardFooter>
                            </Card>
                        )})}
                    </div>
                )}
            </div>
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the record for "{recordToDelete?.projectName}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
