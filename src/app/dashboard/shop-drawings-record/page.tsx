'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

type RecordRow = {
  id: number;
  date: string;
  recordNo: string;
  specSectionNo: string;
  drawingNo: string;
  contractorSubcontractorTrade: string;
  title: string;
  referredTo: string;
  dateSent: string;
  numCopies: string;
  dateRetdReferred: string;
  action: string;
  dateRetdAction: string;
  copiesTo: string[];
};

const initialRow: Omit<RecordRow, 'id'> = {
  date: '', recordNo: '', specSectionNo: '', drawingNo: '', contractorSubcontractorTrade: '', 
  title: '', referredTo: '', dateSent: '', numCopies: '',
  dateRetdReferred: '', action: '', dateRetdAction: '', copiesTo: []
};


export default function ShopDrawingsRecordPage() {
    const image = PlaceHolderImages.find(p => p.id === 'shop-drawings-record');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const [projectName, setProjectName] = useState('');
    const [architectsProjectNo, setArchitectsProjectNo] = useState('');
    const [contractor, setContractor] = useState('');
    const [rows, setRows] = useState<RecordRow[]>([{ id: 1, ...initialRow }]);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), ...initialRow }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleRowChange = (id: number, field: keyof RecordRow, value: string | string[]) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    
    const handleActionCheckboxChange = (id: number, value: string) => {
        const currentAction = rows.find(row => row.id === id)?.action;
        handleRowChange(id, 'action', currentAction === value ? '' : value);
    };

    const handleCopiesCheckboxChange = (id: number, value: string) => {
        const currentValues = rows.find(row => row.id === id)?.copiesTo || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        handleRowChange(id, 'copiesTo', newValues);
    };

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Shop Drawing and Sample Record',
            projectName: projectName || 'Untitled Record',
            data: {
                category: 'Shop Drawing and Sample Record',
                header: { projectName, architectsProjectNo, contractor },
                items: rows.map(row => JSON.stringify(row)),
            },
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), dataToSave);
            toast({ title: 'Record Saved', description: 'The shop drawing record has been saved.' });
        } catch (serverError) {
            const permissionError = new FirestorePermissionError({
                path: 'savedRecords',
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;
        let yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SHOP DRAWING AND SAMPLE RECORD', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Project: ${projectName}`, 14, yPos);
        doc.text(`Architect's Project No: ${architectsProjectNo}`, 150, yPos);
        yPos += 7;
        doc.text(`Contractor: ${contractor}`, 14, yPos);
        yPos += 10;
        
        const head = [
            [
                { content: 'Date Record', rowSpan: 2 },
                { content: 'Spec. Section No. __________\nShop Drawing or Sample Drawing No. __________\n\nTitle', rowSpan: 2, styles: { halign: 'center' } },
                { content: 'Contractor\nSubcontractor\nTrade', rowSpan: 2 },
                { content: '# Record', rowSpan: 2 },
                { content: 'Referred', colSpan: 4 },
                { content: 'Action', rowSpan: 2 },
                { content: 'Date Ret\'d.', rowSpan: 2 },
                { content: 'Copies To', colSpan: 4 },
            ],
            ['To', 'Date Sent', '# Copies', "Date Ret'd.", 'Contractor', 'Owner', 'Field', 'File']
        ];
        
        const body = rows.map(row => [
            row.date,
            `${row.specSectionNo}\n${row.drawingNo}\n\n${row.title}`,
            row.contractorSubcontractorTrade,
            row.recordNo,
            row.referredTo,
            row.dateSent,
            row.numCopies,
            row.dateRetdReferred,
            row.action,
            row.dateRetdAction,
            row.copiesTo.includes('Contractor') ? 'X' : '',
            row.copiesTo.includes('Owner') ? 'X' : '',
            row.copiesTo.includes('Field') ? 'X' : '',
            row.copiesTo.includes('File') ? 'X' : '',
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', halign: 'center' },
            styles: { fontSize: 7, cellPadding: 1, overflow: 'linebreak' },
        });
        
        doc.save('shop-drawing-record.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Shop Drawings Record"
                description="Maintain a record of all shop drawings."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                 <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">Shop Drawing and Sample Record</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <form className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div><Label htmlFor="project">Project</Label><Input id="project" value={projectName} onChange={e => setProjectName(e.target.value)} /></div>
                            <div><Label htmlFor="architects_no">Architect's Project No</Label><Input id="architects_no" value={architectsProjectNo} onChange={e => setArchitectsProjectNo(e.target.value)} /></div>
                            <div><Label htmlFor="contractor_main">Contractor</Label><Input id="contractor_main" value={contractor} onChange={e => setContractor(e.target.value)} /></div>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead rowSpan={2} className="align-bottom">Date Record</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom text-center">Spec/Drawing Info</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom">Contractor/Trade</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom"># Record</TableHead>
                                    <TableHead colSpan={4} className="text-center">Referred</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom">Action</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom">Date Ret'd.</TableHead>
                                    <TableHead colSpan={4} className="text-center">Copies To</TableHead>
                                    <TableHead rowSpan={2} className="align-bottom">Actions</TableHead>
                                </TableRow>
                                <TableRow>
                                    <TableHead>To</TableHead>
                                    <TableHead>Date Sent</TableHead>
                                    <TableHead># Copies</TableHead>
                                    <TableHead>Date Ret'd.</TableHead>
                                    <TableHead>Contractor</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Field</TableHead>
                                    <TableHead>File</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell><Input type="date" value={row.date} onChange={e => handleRowChange(row.id, 'date', e.target.value)} className="w-32"/></TableCell>
                                        <TableCell className="min-w-[200px]">
                                          <Input placeholder="Spec. Section No." value={row.specSectionNo} onChange={e => handleRowChange(row.id, 'specSectionNo', e.target.value)} />
                                          <Input placeholder="Shop/Sample Drawing No." value={row.drawingNo} onChange={e => handleRowChange(row.id, 'drawingNo', e.target.value)} className="mt-1" />
                                          <Textarea placeholder="Title" value={row.title} onChange={e => handleRowChange(row.id, 'title', e.target.value)} rows={2} className="mt-1" />
                                        </TableCell>
                                        <TableCell><Input value={row.contractorSubcontractorTrade} onChange={e => handleRowChange(row.id, 'contractorSubcontractorTrade', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.recordNo} onChange={e => handleRowChange(row.id, 'recordNo', e.target.value)} className="w-20" /></TableCell>
                                        <TableCell><Input value={row.referredTo} onChange={e => handleRowChange(row.id, 'referredTo', e.target.value)} /></TableCell>
                                        <TableCell><Input type="date" value={row.dateSent} onChange={e => handleRowChange(row.id, 'dateSent', e.target.value)} className="w-32" /></TableCell>
                                        <TableCell><Input type="number" value={row.numCopies} onChange={e => handleRowChange(row.id, 'numCopies', e.target.value)} className="w-20" /></TableCell>
                                        <TableCell><Input type="date" value={row.dateRetdReferred} onChange={e => handleRowChange(row.id, 'dateRetdReferred', e.target.value)} className="w-32" /></TableCell>
                                        <TableCell className="min-w-[150px]">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1"><Checkbox checked={row.action === 'approved'} onCheckedChange={() => handleActionCheckboxChange(row.id, 'approved')} id={`approved-${row.id}`} /><Label htmlFor={`approved-${row.id}`}>Approved</Label></div>
                                                <div className="flex items-center gap-1"><Checkbox checked={row.action === 'approved_as_noted'} onCheckedChange={() => handleActionCheckboxChange(row.id, 'approved_as_noted')} id={`approved_as_noted-${row.id}`} /><Label htmlFor={`approved_as_noted-${row.id}`}>App'd as Noted</Label></div>
                                                <div className="flex items-center gap-1"><Checkbox checked={row.action === 'revise_resubmit'} onCheckedChange={() => handleActionCheckboxChange(row.id, 'revise_resubmit')} id={`revise-${row.id}`} /><Label htmlFor={`revise-${row.id}`}>Revise & Resubmit</Label></div>
                                                <div className="flex items-center gap-1"><Checkbox checked={row.action === 'not_approved'} onCheckedChange={() => handleActionCheckboxChange(row.id, 'not_approved')} id={`not_approved-${row.id}`} /><Label htmlFor={`not_approved-${row.id}`}>Not Approved</Label></div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Input type="date" value={row.dateRetdAction} onChange={e => handleRowChange(row.id, 'dateRetdAction', e.target.value)} className="w-32" /></TableCell>
                                        <TableCell><div className="flex gap-1"><Checkbox checked={row.copiesTo.includes('Contractor')} onCheckedChange={() => handleCopiesCheckboxChange(row.id, 'Contractor')} /></div></TableCell>
                                        <TableCell><div className="flex gap-1"><Checkbox checked={row.copiesTo.includes('Owner')} onCheckedChange={() => handleCopiesCheckboxChange(row.id, 'Owner')} /></div></TableCell>
                                        <TableCell><div className="flex gap-1"><Checkbox checked={row.copiesTo.includes('Field')} onCheckedChange={() => handleCopiesCheckboxChange(row.id, 'Field')} /></div></TableCell>
                                        <TableCell><div className="flex gap-1"><Checkbox checked={row.copiesTo.includes('File')} onCheckedChange={() => handleCopiesCheckboxChange(row.id, 'File')} /></div></TableCell>
                                        <TableCell><Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={addRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                        <div className="flex gap-4">
                            <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}