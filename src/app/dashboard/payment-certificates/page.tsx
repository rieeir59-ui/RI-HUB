
'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    const image = PlaceHolderImages.find(p => p.id === 'payment-certificates');
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const [formState, setFormState] = useState({
        toOwner: '',
        attention: '',
        project: '',
        constructionManager: '',
        applicationNumber: '',
        periodFrom: '',
        periodTo: '',
        architectsProjectNo: '',
        distributedTo: [] as string[],
        constructionManagerBy: '',
        constructionManagerDate: '',
        statusOf: '',
        countyOf: '',
        subscribedDay: '',
        notaryPublic: '',
        commissionExpires: '',
        totalContractSum: 0,
        netChanges: 0,
        totalCompleted: 0,
        retainage: 0,
        previousPayments: 0,
        currentPaymentDue: 0,
        totalCertified: 0,
        architectBy: '',
        architectDate: '',
        explanation: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleCheckboxChange = (field: string) => {
        setFormState(prev => {
            const current = prev.distributedTo;
            if (current.includes(field)) {
                return { ...prev, distributedTo: current.filter(item => item !== field) };
            } else {
                return { ...prev, distributedTo: [...current, field] };
            }
        });
    };

    const contractSumToDate = useMemo(() => formState.totalContractSum + formState.netChanges, [formState.totalContractSum, formState.netChanges]);

    useEffect(() => {
        const paymentDue = formState.totalCompleted - formState.retainage - formState.previousPayments;
        setFormState(prev => ({...prev, currentPaymentDue: paymentDue}));
    }, [formState.totalCompleted, formState.retainage, formState.previousPayments]);


    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        
        const dataToSave = {
            category: 'Project Application for Payment',
            items: Object.entries(formState).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
        };

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Project Application for Payment',
                projectName: formState.project || 'Untitled Payment Certificate',
                data: [dataToSave],
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The payment certificate has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let y = 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;

        doc.setFontSize(10);
        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [`To (Owner): ${formState.toOwner}`, `Project: ${formState.project}`],
                [`Attention: ${formState.attention}`, `Construction Manager: ${formState.constructionManager}`],
            ],
            styles: { cellPadding: 1 }
        });
        y = (doc as any).autoTable.previous.finalY;

        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                [
                    { content: '', styles: { cellWidth: 100 } },
                    `Application Number: ${formState.applicationNumber}`,
                ],
                [
                    '', `Period From: ${formState.periodFrom} To: ${formState.periodTo}`
                ],
                [
                    '', `Architect's Project No: ${formState.architectsProjectNo}`
                ],
            ],
            styles: { cellPadding: 1 }
        });

        y = (doc as any).autoTable.previous.finalY + 5;
        
        const distributedText = formState.distributedTo.map(d => `[X] ${d}`).join('\n');
        doc.text('Distributed to:\n' + distributedText, 150, y - 10);
        
        const appText = "The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.";
        doc.setFontSize(9);
        const splitAppText = doc.splitTextToSize(appText, 90);
        doc.setFont('helvetica', 'bold');
        doc.text("Project Application for Payment:", 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(splitAppText, 14, y + 5);
        
        const summaryText = "Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached.\nThe present status for the account for all Contractors is for this Project is as follows:";
        const splitSummaryText = doc.splitTextToSize(summaryText, 90);
        doc.text(splitSummaryText, 110, y + 5);

        y += 40;

        doc.autoTable({
            startY: y,
            theme: 'plain',
            columnStyles: { 0: { cellWidth: 100 } },
            body: [
                ['', `Total Contract Sum (Item A Totals).................... Rs. ${formState.totalContractSum.toFixed(2)}`],
                ['', `Total Net Changes by Change Order (Item B Totals)..... Rs. ${formState.netChanges.toFixed(2)}`],
                ['', `Total Contract Sum to Date (Item C Totals)................ Rs. ${contractSumToDate.toFixed(2)}`],
            ],
            styles: { cellPadding: 1 }
        });
        y = (doc as any).autoTable.previous.finalY + 5;

        doc.autoTable({
            startY: y,
            theme: 'plain',
            body: [
                 ['', `Total Completed & Stored to Date (Item F Totals)............ Rs. ${formState.totalCompleted.toFixed(2)}`],
                 ['', `Retainage (Item H Totals)..................................... Rs. ${formState.retainage.toFixed(2)}`],
                 ['', `Less Previous Totals Payments (Item I Total)............. Rs. ${formState.previousPayments.toFixed(2)}`],
                 ['', `Current Payment Due (Item J Totals)......................... Rs. ${formState.currentPaymentDue.toFixed(2)}`],
            ],
            styles: { cellPadding: 1 }
        });
        y = (doc as any).autoTable.previous.finalY + 5;
        
        doc.text(`Construction Manager: \nBy: ${formState.constructionManagerBy} \nDate: ${formState.constructionManagerDate}`, 14, y);

        y += 20;

        doc.text(`Status of: ${formState.statusOf}`, 14, y);
        doc.text(`County of: ${formState.countyOf}`, 80, y);
        y += 7;
        doc.text(`Subscribed and sworn to before me this Day of: ${formState.subscribedDay}`, 14, y);
        y += 7;
        doc.text(`Notary Public: ${formState.notaryPublic}`, 14, y);
        y += 7;
        doc.text(`My Commission expires: ${formState.commissionExpires}`, 14, y);

        y += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text("Architect's Project Certificate for Payment:", 14, y);
        doc.setFont('helvetica', 'normal');
        y += 5;
        const certText = "In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.";
        const splitCertText = doc.splitTextToSize(certText, 90);
        doc.text(splitCertText, 14, y);

        doc.text(`Total of Amounts Certified ................................... Rs. ${formState.totalCertified.toFixed(2)}\n(Attach explanation if amount certified differs from the amount applies for.)`, 110, y);
        y+= 5;
        doc.text(`Architect:\nBy: ${formState.architectBy}\nDate: ${formState.architectDate}`, 110, y + 20);

        y = Math.max(y + splitCertText.length * 5, y + 40);

        const footerText = "This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.";
        const splitFooterText = doc.splitTextToSize(footerText, doc.internal.pageSize.width - 28);
        doc.text(splitFooterText, 14, y);

        doc.save('payment-certificate.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Application & Certificate for Payment"
                description="Manage payment certificates for your projects."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl text-primary">PROJECT APPLICATION AND PROJECT CERTIFICATE FOR PAYMENT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border p-4 rounded-lg">
                        <div>
                            <Label htmlFor="toOwner">To (Owner)</Label>
                            <Input id="toOwner" name="toOwner" value={formState.toOwner} onChange={handleChange} />
                        </div>
                         <div>
                            <Label htmlFor="project">Project</Label>
                            <Input id="project" name="project" value={formState.project} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="attention">Attention</Label>
                            <Input id="attention" name="attention" value={formState.attention} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="constructionManager">Construction Manager</Label>
                            <Input id="constructionManager" name="constructionManager" value={formState.constructionManager} onChange={handleChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border p-4 rounded-lg">
                        <div>
                            <Label htmlFor="applicationNumber">Application Number</Label><Input id="applicationNumber" name="applicationNumber" value={formState.applicationNumber} onChange={handleChange} />
                            <Label htmlFor="periodFrom" className="mt-2">Period From</Label><Input id="periodFrom" name="periodFrom" type="date" value={formState.periodFrom} onChange={handleChange} />
                            <Label htmlFor="periodTo" className="mt-2">To</Label><Input id="periodTo" name="periodTo" type="date" value={formState.periodTo} onChange={handleChange} />
                            <Label htmlFor="architectsProjectNo" className="mt-2">Architect's Project No</Label><Input id="architectsProjectNo" name="architectsProjectNo" value={formState.architectsProjectNo} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Distributed to:</Label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2"><Checkbox id="dist_owner" checked={formState.distributedTo.includes('Owner')} onCheckedChange={() => handleCheckboxChange('Owner')} /><Label htmlFor="dist_owner">Owner</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_architect" checked={formState.distributedTo.includes('Architect')} onCheckedChange={() => handleCheckboxChange('Architect')} /><Label htmlFor="dist_architect">Architect</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_cm" checked={formState.distributedTo.includes('Contractor Manager')} onCheckedChange={() => handleCheckboxChange('Contractor Manager')} /><Label htmlFor="dist_cm">Contractor Manager</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="dist_others" checked={formState.distributedTo.includes('Others')} onCheckedChange={() => handleCheckboxChange('Others')} /><Label htmlFor="dist_others">Others</Label></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold">Project Application for Payment</h3>
                            <p className="text-xs text-muted-foreground mt-2">The undersigned Construction Manager certifies that the best of the Construction Manager's knowledge, information and belief Work covered by this Project Application for Payment has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractors for Work for which previous Project Certificates for Payments were issued and payments received from the Owner, and that Current Payment shown herein is now due.</p>
                            
                            <div className="mt-4 space-y-2">
                                <h4 className="font-semibold">Construction Manager:</h4>
                                <div className="flex gap-4">
                                    <Input name="constructionManagerBy" placeholder="By" value={formState.constructionManagerBy} onChange={handleChange} />
                                    <Input name="constructionManagerDate" type="date" value={formState.constructionManagerDate} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="statusOf" placeholder="Status of" value={formState.statusOf} onChange={handleChange} />
                                    <Input name="countyOf" placeholder="County of" value={formState.countyOf} onChange={handleChange} />
                                </div>
                                <Input name="subscribedDay" placeholder="Subscribed and sworn to before me this Day of" value={formState.subscribedDay} onChange={handleChange} />
                                <Input name="notaryPublic" placeholder="Notary Public" value={formState.notaryPublic} onChange={handleChange} />
                                <Input name="commissionExpires" placeholder="My Commission expires" value={formState.commissionExpires} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Application is made for Payment, as shown below, in connection with the Project. Project Application Summary, is attached. The present status for the account for all Contractors is for this Project is as follows:</p>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2"><Label className="flex-1">Total Contract Sum (Item A Totals)</Label><Input type="number" name="totalContractSum" value={formState.totalContractSum} onChange={handleNumberChange} className="w-40" /></div>
                                <div className="flex items-center gap-2"><Label className="flex-1">Total Net Changes by Change Order (Item B Totals)</Label><Input type="number" name="netChanges" value={formState.netChanges} onChange={handleNumberChange} className="w-40" /></div>
                                <div className="flex items-center gap-2 font-bold"><Label className="flex-1">Total Contract Sum to Date (Item C Totals)</Label><Input readOnly value={contractSumToDate.toFixed(2)} className="w-40 bg-muted" /></div>
                                <div className="flex items-center gap-2 pt-4 border-t"><Label className="flex-1">Total Completed & Stored to Date (Item F Totals)</Label><Input type="number" name="totalCompleted" value={formState.totalCompleted} onChange={handleNumberChange} className="w-40" /></div>
                                <div className="flex items-center gap-2"><Label className="flex-1">Retainage (Item H Totals)</Label><Input type="number" name="retainage" value={formState.retainage} onChange={handleNumberChange} className="w-40" /></div>
                                <div className="flex items-center gap-2"><Label className="flex-1">Less Previous Totals Payments (Item I Total)</Label><Input type="number" name="previousPayments" value={formState.previousPayments} onChange={handleNumberChange} className="w-40" /></div>
                                <div className="flex items-center gap-2 font-bold"><Label className="flex-1">Current Payment Due (Item J Totals)</Label><Input readOnly value={formState.currentPaymentDue.toFixed(2)} className="w-40 bg-muted" /></div>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                        <div>
                            <h3 className="font-bold">Architect's Project Certificate for Payment:</h3>
                            <p className="text-xs text-muted-foreground mt-2">In accordance with the Contract Documents, based on on-site observations and the data comprising the above Application, the Architect certifies to the Owner that Work has progressed as indicated; that to the best of the Architect's knowledge, information and belief the quality of the Work is in accordance with the Contract Documents; the quality of the Contractors are entitled to payment of the AMOUNTS CERTIFIED.</p>
                        </div>
                         <div>
                            <div className="flex items-center gap-2"><Label className="flex-1">Total of Amounts Certified</Label><Input type="number" name="totalCertified" value={formState.totalCertified} onChange={handleNumberChange} className="w-40" /></div>
                            <Textarea name="explanation" placeholder="Attach explanation if amount certified differs from the amount applied for." className="text-xs mt-2" />
                             <div className="mt-4 space-y-2">
                                <h4 className="font-semibold">Architect:</h4>
                                <div className="flex gap-4">
                                    <Input name="architectBy" placeholder="By" value={formState.architectBy} onChange={handleChange} />
                                    <Input name="architectDate" type="date" value={formState.architectDate} onChange={handleChange} />
                                </div>
                            </div>
                         </div>
                     </div>
                     <p className="text-xs text-center text-muted-foreground pt-4 border-t">This Certificate is not negotiable. The AMOUNTS CERTIFIED are payable on to the Contractors named in Contract Document attached. Issuance, payment and acceptance of payment are without prejudice to any rights of the Owner of the Contractor under this Contract.</p>
                     
                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
