'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp, doc, setDoc, onSnapshot, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BillItem {
    id: string; // Use string for Firestore document IDs
    srNo: string;
    description: string;
    unit: string;
    qty: number;
    rate: number;
    isHeader: boolean;
}

const initialData: Omit<BillItem, 'id'>[] = [
    { srNo: '1', description: 'EXCAVATION', unit: '', qty: 0, rate: 0, isHeader: true },
    { srNo: '', description: 'Excavation for isolated, stripe/combined & Brick foundations in clay and sandy soil including cost of dressing, leveling and compaction in approved manners and disposal of surplus excavated soil away from site, all excavated area will be proof rolled as directed by the Consultant/Engineer incharge.', unit: '', qty: 0, rate: 0, isHeader: false },
    { srNo: '', description: 'Basement', unit: 'C.FT', qty: 59972, rate: 0, isHeader: false },
    { srNo: '', description: 'Ground Floor', unit: 'C.FT', qty: 225, rate: 0, isHeader: false },
    { srNo: '2', description: 'BACK FILLING', unit: '', qty: 0, rate: 0, isHeader: true },
];

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'bill-of-quantity');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [items, setItems] = useState<BillItem[]>([]);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [projectName, setProjectName] = useState('Project BOQ');
  const [boqDocId, setBoqDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for Bill of Quantity items
  useEffect(() => {
    if (!firestore) return;
    
    // For this example, we'll listen to the first BOQ document found.
    // In a real app, you'd have a way to select or create different BOQs.
    const boqCollection = collection(firestore, 'billOfQuantities');
    const q = query(boqCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            // If no BOQ exists, create one with initial data
            const newBoqRef = doc(boqCollection);
            const batch = writeBatch(firestore);

            initialData.forEach((itemData, index) => {
                const itemRef = doc(collection(newBoqRef, 'items'));
                batch.set(itemRef, {...itemData, order: index});
            });

            batch.set(newBoqRef, { projectName: 'Project BOQ', createdAt: serverTimestamp() });
            
            batch.commit().then(() => {
                setBoqDocId(newBoqRef.id);
            }).catch(e => console.error("Error creating initial BOQ:", e));

        } else {
            const mainBoqDoc = snapshot.docs[0];
            setBoqDocId(mainBoqDoc.id);
            setProjectName(mainBoqDoc.data().projectName);
            
            const itemsCollection = collection(firestore, 'billOfQuantities', mainBoqDoc.id, 'items');
            const itemsQuery = query(itemsCollection, orderBy('order'));
            
            onSnapshot(itemsQuery, (itemsSnapshot) => {
                const fetchedItems = itemsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as BillItem));
                setItems(fetchedItems);
                setIsLoading(false);
            });
        }
    }, (error) => {
        console.error("Error fetching BOQ:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);


  const handleItemChange = (id: string, field: keyof BillItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = async () => {
    if (!firestore || !boqDocId) return;
    const newItemRef = doc(collection(firestore, 'billOfQuantities', boqDocId, 'items'));
    const newItem: Omit<BillItem, 'id'> & { order: number } = {
        srNo: '', description: '', unit: '', qty: 0, rate: 0, isHeader: false, order: items.length
    };
    await setDoc(newItemRef, newItem);
  };

  const removeItem = async (id: string) => {
    if (!firestore || !boqDocId) return;
    const itemRef = doc(firestore, 'billOfQuantities', boqDocId, 'items', id);
    // In a real app you might want to move this to a 'deleted' collection instead
    await deleteDoc(itemRef);
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  }, [items]);

  const handleSave = async () => {
    if (!firestore || !boqDocId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not ready.' });
      return;
    }

    toast({ title: 'Saving...', description: 'Your changes are being saved.'});

    const batch = writeBatch(firestore);

    // Save current state as a new version
    const versionRef = doc(collection(firestore, 'billOfQuantities', boqDocId, 'versions'));
    batch.set(versionRef, {
        projectName,
        items,
        totalAmount: totalAmount,
        savedAt: serverTimestamp(),
        savedBy: currentUser?.name || 'Unknown User'
    });

    // Update the main items
    items.forEach(item => {
        const itemRef = doc(firestore, 'billOfQuantities', boqDocId, 'items', item.id);
        const { id, ...itemData } = item;
        batch.update(itemRef, itemData);
    });
    
    // Update project name
    const boqRef = doc(firestore, 'billOfQuantities', boqDocId);
    batch.update(boqRef, { projectName });
    
    try {
      await batch.commit();
      toast({ title: 'Record Saved', description: 'The Bill of Quantity has been saved and versioned.' });
      setIsSaveOpen(false);
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: `billOfQuantities/${boqDocId}`,
            operation: 'write',
            requestResourceData: { items: items.length }
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ISBAH HASSAN & ASSOCIATES', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.setFontSize(12);
    doc.text('BILL OF QUANTITY', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;
    
    const head = [['Sr. No', 'Description', 'Unit', 'Qty', 'Rate', 'Amount (Rs)']];
    const body = items.map(item => {
        if (item.isHeader) {
            return [{ content: `${item.srNo} ${item.description}`, colSpan: 6, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }];
        }
        return [
            item.srNo,
            item.description,
            item.unit,
            item.qty.toString(),
            item.rate.toFixed(2),
            (item.qty * item.rate).toFixed(2)
        ];
    });

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [45, 95, 51] },
        didParseCell: (data: any) => {
            const row = items[data.row.index];
            if (row?.isHeader) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = '#f0f0f0';
            }
        }
    });
    
    yPos = (doc as any).autoTable.previous.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT RS: ${totalAmount.toFixed(2)}`, 14, yPos);

    doc.save('bill-of-quantity.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading Bill of Quantity...</p>
        </div>
    );
  }


  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Bill Of Quantity"
        description="Manage the bill of quantity for your projects."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-center font-headline text-2xl text-primary">BILL OF QUANTITY</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Sr. No</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Unit</TableHead>
                            <TableHead className="w-32">Qty</TableHead>
                            <TableHead className="w-32">Rate</TableHead>
                            <TableHead className="w-40">Amount (Rs)</TableHead>
                            <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id} className={item.isHeader ? 'bg-muted' : ''}>
                                <TableCell>
                                    <Input value={item.srNo} onChange={e => handleItemChange(item.id, 'srNo', e.target.value)} className={item.isHeader ? 'font-bold' : ''} />
                                </TableCell>
                                <TableCell>
                                    <Textarea value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} rows={item.isHeader ? 1 : 4} className={item.isHeader ? 'font-bold' : ''}/>
                                </TableCell>
                                <TableCell><Input value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} /></TableCell>
                                <TableCell><Input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} /></TableCell>
                                <TableCell>{(item.qty * item.rate).toFixed(2)}</TableCell>
                                <TableCell><Button variant="destructive" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <Button onClick={addItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                <div className="text-lg font-bold">TOTAL AMOUNT RS: {totalAmount.toFixed(2)}</div>
                <div className="flex gap-4">
                     <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Save Bill of Quantity</DialogTitle>
                                <DialogDescription>
                                    This will save the current state as a new version.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="recordName">Project Name</Label>
                                <Input id="recordName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleSave}>Save Version</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
