'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'construction-change-director');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [formState, setFormState] = useState({
    project: '',
    projectAddress: '',
    directiveNo: '',
    date: '',
    architectsProjectNo: '',
    toContractor: '',
    contractorAddress: '',
    contractFor: '',
    contractDate: '',
    description: '',
    adjustmentType: 'lumpSum',
    lumpSumType: 'increase',
    lumpSumAmount: 0,
    unitPrice: 0,
    unitPricePer: '',
    adjustmentBasis: '',
    timeAdjustmentType: 'adjusted',
    timeAdjustmentDays: 0,
    architectBy: '',
    architectAddress: '',
    architectDate: '',
    contractorBy: '',
    contractorAddressSignature: '',
    contractorDate: '',
    ownerBy: '',
    ownerAddress: '',
    ownerDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
        return;
    }

    const dataToSave = {
        category: 'Construction Change Directive',
        items: Object.entries(formState).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
    };

    try {
        await addDoc(collection(firestore, 'savedRecords'), {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: 'Construction Change Directive',
            projectName: formState.project || 'Untitled Directive',
            data: [dataToSave],
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Record Saved', description: 'The directive has been saved.' });
    } catch (error) {
        console.error("Error saving document: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 95, 51);
    doc.text('CONSTRUCTION CHANGE DIRECTIVE', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.autoTable({
        startY: y,
        theme: 'plain',
        body: [
            [`Project: ${formState.project}, ${formState.projectAddress}`, `Directive No. ${formState.directiveNo}`],
            [`To Contractor: ${formState.toContractor}`, `Date: ${formState.date}`],
            [`(Name, Address): ${formState.contractorAddress}`, `Architects Project No: ${formState.architectsProjectNo}`],
            [``, `Contract For: ${formState.contractFor}`],
            [``, `Contract Date: ${formState.contractDate}`],
        ],
    });
    y = doc.autoTable.previous.finalY + 10;
    
    doc.text('You are hereby directed to make the following change(s) in this Contract:', 14, y);
    y += 7;
    doc.rect(14, y, doc.internal.pageSize.width - 28, 30);
    const descLines = doc.splitTextToSize(formState.description, doc.internal.pageSize.width - 34);
    doc.text(descLines, 17, y + 5);
    y += 40;

    doc.setFont('helvetica', 'bold');
    doc.text('Proposed Adjustments', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');

    let adjustmentText1 = `1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:\n`;
    if (formState.adjustmentType === 'lumpSum') {
        adjustmentText1 += `   - Lump Sum (${formState.lumpSumType}) of Rs. ${formState.lumpSumAmount.toFixed(2)}`;
    } else if (formState.adjustmentType === 'unitPrice') {
        adjustmentText1 += `   - Unit Price of Rs. ${formState.unitPrice.toFixed(2)} per ${formState.unitPricePer}`;
    } else {
        adjustmentText1 += `   - As follows: ${formState.adjustmentBasis}`;
    }
    const splitAdjustment1 = doc.splitTextToSize(adjustmentText1, doc.internal.pageSize.width - 28);
    doc.text(splitAdjustment1, 14, y);
    y += splitAdjustment1.length * 5 + 5;
    
    let adjustmentText2 = `2. The Contract Time is proposed to ${formState.timeAdjustmentType}.`;
    if(formState.timeAdjustmentType !== 'remain unchanged') {
        adjustmentText2 += ` The proposed adjustment, if any, is an increase of ${formState.timeAdjustmentDays} days.`;
    }
    const splitAdjustment2 = doc.splitTextToSize(adjustmentText2, doc.internal.pageSize.width - 28);
    doc.text(splitAdjustment2, 14, y);
    y += splitAdjustment2.length * 5 + 10;
    
    const note1 = "When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD), and the Contractor shall proceed with the change(s) described above.";
    const splitNote1 = doc.splitTextToSize(note1, doc.internal.pageSize.width - 28);
    doc.text(splitNote1, 14, y);
    y += splitNote1.length * 5 + 10;
    
    const note2 = "Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.";
    const splitNote2 = doc.splitTextToSize(note2, doc.internal.pageSize.width - 28);
    doc.text(splitNote2, 14, y);
    y += splitNote2.length * 5 + 10;

    doc.autoTable({
        startY: y,
        theme: 'plain',
        body: [
            ['Architect', 'Contractor', 'Owner'],
            [formState.architectAddress, formState.contractorAddressSignature, formState.ownerAddress],
            [`By: ${formState.architectBy}`, `By: ${formState.contractorBy}`, `By: ${formState.ownerBy}`],
            [`Date: ${formState.architectDate}`, `Date: ${formState.contractorDate}`, `Date: ${formState.ownerDate}`],
        ],
        styles: { halign: 'center' }
    });

    doc.save('construction-change-directive.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  };
  

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Construction Change Directive"
        description="Oversee and direct construction changes."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-3xl text-primary">Construction Change Directive</CardTitle>
        </CardHeader>
        <CardContent>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Project (Name, Address)</Label><Input name="project" value={formState.project} onChange={handleChange} /></div>
                    <div><Label>Directive No.</Label><Input name="directiveNo" value={formState.directiveNo} onChange={handleChange} /></div>
                    <div><Label>To Contractor (Name, Address)</Label><Input name="toContractor" value={formState.toContractor} onChange={handleChange} /></div>
                    <div><Label>Date</Label><Input name="date" type="date" value={formState.date} onChange={handleChange} /></div>
                    <div><Label>Architects Project No</Label><Input name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} /></div>
                    <div><Label>Contract For</Label><Input name="contractFor" value={formState.contractFor} onChange={handleChange} /></div>
                    <div><Label>Contract Date</Label><Input name="contractDate" type="date" value={formState.contractDate} onChange={handleChange} /></div>
                </div>

                <div>
                    <Label>You are hereby directed to make the following change(s) in this Contract:</Label>
                    <Textarea name="description" value={formState.description} onChange={handleChange} rows={4} />
                </div>
                
                <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="font-bold text-lg">Proposed Adjustments</h3>
                    <div className="space-y-2">
                        <Label>1. The proposed basis of adjustment to the Contract Sum or Guaranteed Maximum Price is:</Label>
                        <RadioGroup name="adjustmentType" value={formState.adjustmentType} onValueChange={(v) => handleRadioChange('adjustmentType', v)} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="lumpSum" id="adj_lump"/>
                                <Label htmlFor="adj_lump" className="flex items-center gap-2">Lump Sum 
                                <RadioGroup name="lumpSumType" value={formState.lumpSumType} onValueChange={(v) => handleRadioChange('lumpSumType', v)} className="flex gap-2"><div className="flex items-center gap-1"><RadioGroupItem value="increase" id="lump_inc" /><Label htmlFor="lump_inc">increase</Label></div><div className="flex items-center gap-1"><RadioGroupItem value="decrease" id="lump_dec" /><Label htmlFor="lump_dec">decrease</Label></div></RadioGroup>
                                 of Rs.</Label>
                                <Input type="number" name="lumpSumAmount" value={formState.lumpSumAmount} onChange={handleNumberChange} className="w-40" />
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="unitPrice" id="adj_unit"/>
                                <Label htmlFor="adj_unit">Unit Price of Rs.</Label>
                                <Input type="number" name="unitPrice" value={formState.unitPrice} onChange={handleNumberChange} className="w-32" />
                                <Label>per</Label>
                                <Input name="unitPricePer" value={formState.unitPricePer} onChange={handleChange} className="w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="asFollows" id="adj_as_follows"/>
                                <Label htmlFor="adj_as_follows">As follows:</Label>
                                <Textarea name="adjustmentBasis" value={formState.adjustmentBasis} onChange={handleChange} rows={2} />
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="space-y-2">
                        <Label>2. The Contract Time is proposed to:</Label>
                        <RadioGroup name="timeAdjustmentType" value={formState.timeAdjustmentType} onValueChange={(v) => handleRadioChange('timeAdjustmentType', v)} className="flex items-center gap-4">
                            <div className="flex items-center gap-2"><RadioGroupItem value="adjusted" id="time_adj" /><Label htmlFor="time_adj" className="flex items-center gap-2">be adjusted (an increase of <Input type="number" name="timeAdjustmentDays" value={formState.timeAdjustmentDays} onChange={handleNumberChange} className="w-20" /> days)</Label></div>
                            <div className="flex items-center gap-2"><RadioGroupItem value="remain unchanged" id="time_unchanged" /><Label htmlFor="time_unchanged">remain unchanged</Label></div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="text-sm space-y-2 text-muted-foreground">
                    <p>When signed by the Owner and Architect and received by the Contractor, this document becomes effective IMMEDIATELY as a Construction Change Directive (CCD) , and the Contractor shall proceed with the change(s) described above.</p>
                    <p className="font-bold">Signature by the Contractor indicates the Contractor's agreement with the proposed adjustments in Contract Sum and Contract Time set forth in this Construction Change Directive.</p>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                    <div className="space-y-2">
                        <h4 className="font-bold text-center">Architect</h4>
                        <Input name="architectAddress" placeholder="Address" value={formState.architectAddress} onChange={handleChange} />
                        <Input name="architectBy" placeholder="By" value={formState.architectBy} onChange={handleChange} />
                        <Input name="architectDate" type="date" value={formState.architectDate} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-center">Contractor</h4>
                        <Input name="contractorAddressSignature" placeholder="Address" value={formState.contractorAddressSignature} onChange={handleChange} />
                        <Input name="contractorBy" placeholder="By" value={formState.contractorBy} onChange={handleChange} />
                        <Input name="contractorDate" type="date" value={formState.contractorDate} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-center">Owner</h4>
                        <Input name="ownerAddress" placeholder="Address" value={formState.ownerAddress} onChange={handleChange} />
                        <Input name="ownerBy" placeholder="By" value={formState.ownerBy} onChange={handleChange} />
                        <Input name="ownerDate" type="date" value={formState.ownerDate} onChange={handleChange} />
                    </div>
                </div>

                 <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button type="button" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
