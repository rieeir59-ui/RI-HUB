
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentUser } from '@/context/UserContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { getFormUrlFromFileName } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type SavedRecordData = {
    category: string;
    items: (string | Record<string, any>)[];
    [key: string]: any;
};

type SavedRecord = {
    id: string;
    employeeId: string;
    employeeName: string;
    fileName: string;
    projectName: string;
    createdAt: Timestamp;
    data: SavedRecordData[] | Record<string, any>;
};


const generateTaskAssignmentPdf = (doc: jsPDF, record: SavedRecord) => {
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Task Assignment", doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(10);
    const dataArray = Array.isArray(record.data) ? record.data : [record.data];
    const taskSection = dataArray.find(d => d.category === 'Task Assignment');

    if (!taskSection || !taskSection.items) {
      console.error("Could not find Task Assignment data in the record.");
      generateDefaultPdf(doc, record); // Fallback to default PDF
      return;
    }

    const taskData = taskSection.items.reduce((acc, item) => {
        const [key, ...value] = (item as string).split(': ');
        acc[key] = value.join(': ');
        return acc;
    }, {} as Record<string, string>);


    const body = [
        ['Project Name', taskData.projectName],
        ['Task Name', taskData.taskName],
        ['Task Description', taskData.taskDescription],
        ['Assigned To', taskData.assignedTo],
        ['Due Date', taskData.dueDate],
        ['Assigned By', taskData.assignedBy],
    ];

    (doc as any).autoTable({
        startY: yPos,
        theme: 'grid',
        head: [['Field', 'Details']],
        body: body,
        headStyles: { fillColor: [45, 95, 51] }
    });
};

const generateDefaultPdf = (doc: jsPDF, record: SavedRecord) => {
    let yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(record.projectName, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    
    const headerData = [
        [`File: ${record.fileName}`],
        [`Saved by: ${record.employeeName}`],
        [`Date: ${record.createdAt.toDate().toLocaleDateString()}`],
    ];

    (doc as any).autoTable({
        startY: yPos,
        theme: 'plain',
        body: headerData,
        styles: { fontSize: 10 },
    });

    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    const dataArray = Array.isArray(record.data) ? record.data : [record.data];

    dataArray.forEach((section: any) => {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        
        const body: (string | number)[][] = [];

        if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: any) => {
                try {
                    const parsed = JSON.parse(item);
                    Object.entries(parsed).forEach(([key, value]) => {
                        if (typeof value !== 'object' && value !== null) {
                            body.push([key, String(value)]);
                        }
                    });
                } catch {
                    const parts = String(item).split(':');
                    if (parts.length > 1) {
                        body.push([parts[0], parts.slice(1).join(':').trim()]);
                    } else {
                        body.push([item, '']);
                    }
                }
            });
        }

        (doc as any).autoTable({
            head: [[section.category || 'Details']],
            body: body.length > 0 ? body : [['No items to display']],
            startY: yPos,
            theme: 'grid',
            headStyles: { fontStyle: 'bold', fillColor: [45, 95, 51], textColor: 255 },
            styles: { fontSize: 9 }
        });

        yPos = (doc as any).autoTable.previous.finalY + 10;
    });
}

const generateChecklistPdf = (doc: jsPDF, record: SavedRecord) => {
    let yPos = 20;

    const data = Array.isArray(record.data) ? record.data : [record.data];
    const headerInfo = data.find(d => d.category === 'Project Header');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT CHECKLIST', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(10);
    const projectDetails = [
      ['Project:', record.projectName],
      ['Name, Address: Architect:', headerInfo?.architectName || ''],
      ["Architect's Project No:", headerInfo?.projectNo || ''],
      ['Project Date:', headerInfo?.projectDate || ''],
    ];

    (doc as any).autoTable({
      startY: yPos,
      theme: 'plain',
      body: projectDetails,
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    data.filter(d => d.category !== 'Project Header').forEach(section => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        
        const [mainTitle, subTitle] = section.category.split(' - ');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(mainTitle, 14, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.text(subTitle, 20, yPos);
        yPos += 7;

        (doc as any).autoTable({
            startY: yPos,
            body: section.items.map((item: string) => [`[X]`, item]),
            theme: 'plain',
            styles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 10 } }
        });
        yPos = (doc as any).autoTable.previous.finalY + 5;
    });
}

const handleDownload = (record: SavedRecord) => {
    const doc = new jsPDF() as any;
    
    switch (record.fileName) {
        case 'Project Checklist':
            generateChecklistPdf(doc, record);
            break;
        case 'Task Assignment':
            generateTaskAssignmentPdf(doc, record);
            break;
        default:
            generateDefaultPdf(doc, record);
            break;
    }

    doc.save(`${record.projectName.replace(/\s+/g, '_')}_${record.fileName.replace(/\s+/g, '_')}.pdf`);
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

    const openDeleteDialog = (record: SavedRecord) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete || !firestore) return;

        const docRef = doc(firestore, 'savedRecords', recordToDelete.id);
        try {
            await deleteDoc(docRef);
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
                 <Card>
                    <CardHeader>
                        <CardTitle>My Saved Records</CardTitle>
                        <CardDescription>A list of all documents you have saved.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {error ? (
                            <div className="text-center py-12 text-destructive">
                                <p>{error}</p>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>You haven't saved any records yet. Save a document from another page to see it here.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sr.No</TableHead>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record, index) => {
                                        const formUrl = getFormUrlFromFileName(record.fileName, 'employee-dashboard');
                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{record.employeeName}</TableCell>
                                                <TableCell>{record.projectName}</TableCell>
                                                <TableCell>{record.fileName}</TableCell>
                                                <TableCell>{record.createdAt.toDate().toLocaleDateString()}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownload(record)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {formUrl && (
                                                        <Button asChild variant="ghost" size="icon">
                                                            <Link href={`${formUrl}?id=${record.id}`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(record)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                 </Card>
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
