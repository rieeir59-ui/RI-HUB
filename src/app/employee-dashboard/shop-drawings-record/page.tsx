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

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

type RecordRow = {
  id: number;
  date: string;
  recordNo: string;
  specSectionNo: string;
  drawingNo: string;
  contractor: string;
  subcontractor: string;
  trade: string;
  title: string;
  referredTo: string;
  action: string;
  dateSent: string;
  numCopies: string;
  dateRetd: string;
  copiesTo: string[];
};

const initialRow: Omit<RecordRow, 'id'> = {
  date: '', recordNo: '', specSectionNo: '', drawingNo: '', contractor: '', subcontractor: '',
  trade: '', title: '', referredTo: '', action: '', dateSent: '', numCopies: '',
  dateRetd: '', copiesTo: []
};


export default function ShopDrawingsRecordPage() {
    const image = PlaceHolderImages.find(p => p.id === 'shop-drawings-record');
    const { toast } = useToast();
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
    
    const handleCheckboxChange = (id: number, field: keyof RecordRow, value: string) => {
        const currentAction = rows.find(row => row.id === id)?.action;
        handleRowChange(id, field, currentAction === value ? '' : value);
    };

    const handleMultiCheckboxChange = (id: number, field: keyof RecordRow, value: string) => {
        const currentValues = rows.find(row => row.id === id)?.copiesTo || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        handleRowChange(id, 'copiesTo', newValues);
    };

    const handleSave = () => {
        toast({ title: 'Record Saved', description: 'The shop drawing record has been saved.' });
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
        
        const head = [[
            'Date', 'Record #', 'Spec Section', 'Drawing No.', 'Contractor', 'Subcontractor', 
            'Trade', 'Title', 'Referred To', 'Action', 'Date Sent', '# Copies', 'Date Ret\'d.', 'Copies To'
        ]];
        
        const body = rows.map(row => [
            row.date, row.recordNo, row.specSectionNo, row.drawingNo, row.contractor, row.subcontractor,
            row.trade, row.title, row.referredTo, row.action, row.dateSent, row.numCopies,
            row.dateRetd, row.copiesTo.join(', ')
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [45, 95, 51], fontSize: 8 },
            styles: { fontSize: 8, cellPadding: 1 },
            columnStyles: {
                0: { cellWidth: 18 }, 1: { cellWidth: 15 }, 2: { cellWidth: 18 }, 3: { cellWidth: 20 },
                4: { cellWidth: 20 }, 5: { cellWidth: 22 }, 6: { cellWidth: 15 }, 7: { cellWidth: 25 },
                8: { cellWidth: 18 }, 9: { cellWidth: 22 }, 10: { cellWidth: 18 }, 11: { cellWidth: 15 },
                12: { cellWidth: 18 }, 13: { cellWidth: 'auto' }
            }
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
                    <CardTitle className="text-center font-headline text-3xl text-primary">Shop Drawing and Sample Record</CardTitle>
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
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Record #</TableHead>
                                    <TableHead>Spec. Section</TableHead>
                                    <TableHead>Drawing No.</TableHead>
                                    <TableHead>Contractor</TableHead>
                                    <TableHead>Subcontractor</TableHead>
                                    <TableHead>Trade</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Referred To</TableHead>
                                    <TableHead className="min-w-[200px]">Action</TableHead>
                                    <TableHead className="w-[120px]">Date Sent</TableHead>
                                    <TableHead># Copies</TableHead>
                                    <TableHead className="w-[120px]">Date Ret'd.</TableHead>
                                    <TableHead className="min-w-[220px]">Copies To</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell><Input type="date" value={row.date} onChange={e => handleRowChange(row.id, 'date', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.recordNo} onChange={e => handleRowChange(row.id, 'recordNo', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.specSectionNo} onChange={e => handleRowChange(row.id, 'specSectionNo', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.drawingNo} onChange={e => handleRowChange(row.id, 'drawingNo', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.contractor} onChange={e => handleRowChange(row.id, 'contractor', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.subcontractor} onChange={e => handleRowChange(row.id, 'subcontractor', e.target.value)} /></TableCell>
                                        <TableCell><Input value={row.trade} onChange={e => handleRowChange(row.id, 'trade', e.target.value)} /></TableCell>
                                        <TableCell><Textarea value={row.title} onChange={e => handleRowChange(row.id, 'title', e.target.value)} rows={1} /></TableCell>
                                        <TableCell><Input value={row.referredTo} onChange={e => handleRowChange(row.id, 'referredTo', e.target.value)} /></TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2"><Checkbox checked={row.action === 'approved'} onCheckedChange={() => handleCheckboxChange(row.id, 'action', 'approved')} id={`approved-${row.id}`} /><Label htmlFor={`approved-${row.id}`}>Approved</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.action === 'approved_as_noted'} onCheckedChange={() => handleCheckboxChange(row.id, 'action', 'approved_as_noted')} id={`approved_as_noted-${row.id}`} /><Label htmlFor={`approved_as_noted-${row.id}`}>App'd as Noted</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.action === 'revise_resubmit'} onCheckedChange={() => handleCheckboxChange(row.id, 'action', 'revise_resubmit')} id={`revise-${row.id}`} /><Label htmlFor={`revise-${row.id}`}>Revise & Resubmit</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.action === 'not_approved'} onCheckedChange={() => handleCheckboxChange(row.id, 'action', 'not_approved')} id={`not_approved-${row.id}`} /><Label htmlFor={`not_approved-${row.id}`}>Not Approved</Label></div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Input type="date" value={row.dateSent} onChange={e => handleRowChange(row.id, 'dateSent', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" value={row.numCopies} onChange={e => handleRowChange(row.id, 'numCopies', e.target.value)} /></TableCell>
                                        <TableCell><Input type="date" value={row.dateRetd} onChange={e => handleRowChange(row.id, 'dateRetd', e.target.value)} /></TableCell>
                                         <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('contractor')} onCheckedChange={() => handleMultiCheckboxChange(row.id, 'copiesTo', 'contractor')} id={`ct_contractor-${row.id}`} /><Label htmlFor={`ct_contractor-${row.id}`}>Contractor</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('owner')} onCheckedChange={() => handleMultiCheckboxChange(row.id, 'copiesTo', 'owner')} id={`ct_owner-${row.id}`} /><Label htmlFor={`ct_owner-${row.id}`}>Owner</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('field')} onCheckedChange={() => handleMultiCheckboxChange(row.id, 'copiesTo', 'field')} id={`ct_field-${row.id}`} /><Label htmlFor={`ct_field-${row.id}`}>Field</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox checked={row.copiesTo.includes('file')} onCheckedChange={() => handleMultiCheckboxChange(row.id, 'copiesTo', 'file')} id={`ct_file-${row.id}`} /><Label htmlFor={`ct_file-${row.id}`}>File</Label></div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
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