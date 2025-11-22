'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Section = ({ title, children, className }: { title?: string; children: React.ReactNode, className?: string }) => (
  <div className={`mb-6 ${className}`}>
    {title && <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FormCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-center font-headline text-2xl text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const RetainageForm = () => {
    const { toast } = useToast();
    
    const handleSave = () => toast({ title: 'Saved', description: 'Consent for retainage release saved.'});
    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '________________';
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSENT OF SURETY TO REDUCTION IN OR PARTIAL RELEASE OF RETAINAGE', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(10);
        doc.text(`Project: ${getVal('retain_project_name')}`, 14, y);
        doc.text(`Architects Project No: ${getVal('retain_architect_no')}`, 120, y);
        y += 7;
        doc.text(`(Name, Address): ${getVal('retain_project_address')}`, 14, y);
        y += 7;
        doc.text(`Contract For: ${getVal('retain_contract_for')}`, 14, y);
        doc.text(`Contract Date: ${getVal('retain_contract_date')}`, 120, y);
        y += 10;
        
        doc.text('To (Owner):', 14, y);
        y += 5;
        doc.rect(14, y, 90, 25);
        doc.text(doc.splitTextToSize(getVal('retain_owner_to'), 85), 16, y + 5);
        y += 35;
        
        const bodyText1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the (here insert named and address of Surety as it appears in the bond).`;
        doc.text(doc.splitTextToSize(bodyText1, 182), 14, y);
        y += 14;
        doc.text(getVal('retain_surety_name'), 14, y);
        y += 7;
        doc.text(', SURETY,', 14, y);
        y += 10;
        
        doc.text(`On bond of (here insert named and address of Contractor as it appears in the bond).`, 14, y);
        y += 7;
        doc.text(getVal('retain_contractor_name'), 14, y);
        y += 7;
        doc.text(', CONTRACTOR,', 14, y);
        y += 10;

        doc.text('Hereby approves the reduction in or partial release of retainage to the Contractor as follows:', 14, y);
        y += 10;
        doc.text(getVal('retain_approval_details'), 14, y);
        y += 14;

        const bodyText2 = `The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to (here insert named and address of Owner).`;
        doc.text(doc.splitTextToSize(bodyText2, 182), 14, y);
        y += 14;
        doc.text(getVal('retain_owner_name'), 14, y);
        y += 7;
        doc.text(', OWNER,', 14, y);
        y += 7;
        doc.text('As set forth in the said Surety\'s bond.', 14, y);
        y += 14;
        
        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this day of ${getVal('retain_day')} , 20 ${getVal('retain_year')}`, 14, y);
        y += 14;

        doc.text(`Surety: ${getVal('retain_surety_final')}`, 14, y);
        y += 10;
        doc.text(`Signature of Authorized Representative: ____________________`, 14, y);
        y += 7;
        doc.text(`Title: ${getVal('retain_title')}`, 14, y);

        doc.save('Consent-Retainage.pdf');
        toast({ title: 'Download Started', description: 'Consent for Retainage PDF is being generated.' });
    };

    return (
        <FormCard title="Consent of Surety to Reduction in or Partial Release of Retainage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input id="retain_project_name" placeholder="Project Name" />
                <Input id="retain_project_address" placeholder="Project Address" />
                <Input id="retain_architect_no" placeholder="Architects Project No" />
                <Input id="retain_contract_for" placeholder="Contract For" />
                <Input id="retain_contract_date" type="date" />
            </div>
            <Label htmlFor="retain_owner_to">To: (Owner)</Label>
            <Textarea id="retain_owner_to" placeholder="Owner's Name and Address" />
            <p className="text-sm mt-4">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the</p>
            <Input id="retain_surety_name" placeholder="(here insert named and address of Surety as it appears in the bond)" className="my-2" />
            <p>, SURETY,</p>
            <p className="text-sm mt-2">On bond of</p>
            <Input id="retain_contractor_name" placeholder="(here insert named and address of Contractor as it appears in the bond)" className="my-2" />
            <p>, CONTRACTOR,</p>
            <p className="text-sm mt-2">Hereby approves the reduction in or partial release of retainage to the Contractor as follows:</p>
            <Textarea id="retain_approval_details" className="my-2" />
             <p className="text-sm mt-2">The Surety agrees that such reduction in or partial release of retainage to the Contractor shall not relieve the Surety of any of its obligations to</p>
             <Input id="retain_owner_name" placeholder="(here insert named and address of Owner)" className="my-2" />
            <p>, OWNER,</p>
            <p className="text-sm mt-2">As set forth in the said Surety's bond.</p>
            <div className="flex items-center gap-2 mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of <Input id="retain_day" className="w-24" />, 20 <Input id="retain_year" className="w-20" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Input id="retain_surety_final" placeholder="Surety" />
                <Input id="retain_title" placeholder="Title" />
            </div>
            <div className="mt-4">Signature of Authorized Representative: ____________________</div>
            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
        </FormCard>
    );
};

const FinalPaymentForm = () => {
    const { toast } = useToast();
    
    const handleSave = () => toast({ title: 'Saved', description: 'Consent for final payment saved.'});
    const handleDownload = () => {
         const doc = new jsPDF();
        let y = 20;

        const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '________________';
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSENT OF SURETY COMPANY TO FINAL PAYMENT', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 15;

        doc.setFontSize(10);
        doc.text(`Project: ${getVal('final_project_name')}`, 14, y);
        doc.text(`Architects Project No: ${getVal('final_architect_no')}`, 120, y);
        y += 7;
        doc.text(`(Name, Address): ${getVal('final_project_address')}`, 14, y);
        y += 7;
        doc.text(`Contract For: ${getVal('final_contract_for')}`, 14, y);
        doc.text(`Contract Date: ${getVal('final_contract_date')}`, 120, y);
        y += 10;
        
        doc.text('To (Owner):', 14, y);
        y += 5;
        doc.rect(14, y, 90, 25);
        doc.text(doc.splitTextToSize(getVal('final_owner_to'), 85), 16, y + 5);
        y += 35;
        
        const bodyText1 = `In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the`;
        doc.text(doc.splitTextToSize(bodyText1, 182), 14, y);
        y += 7;
        doc.text(getVal('final_surety_name'), 14, y);
        y += 7;
        doc.text(', SURETY COMPANY,', 14, y);
        y += 10;
        
        doc.text(`On bond of`, 14, y);
        y += 7;
        doc.text(getVal('final_contractor_name'), 14, y);
        y += 7;
        doc.text(', CONTRACTOR,', 14, y);
        y += 10;

        const bodyText2 = `Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to`;
        doc.text(doc.splitTextToSize(bodyText2, 182), 14, y);
        y += 14;
        doc.text(getVal('final_owner_name'), 14, y);
        y += 7;
        doc.text(', OWNER,', 14, y);
        y += 7;
        doc.text('As set forth in the said Surety\'s bond.', 14, y);
        y += 14;
        
        doc.text(`In Witness Whereof, The Surety has hereunto set its hand this day of ${getVal('final_day')} , 20 ${getVal('final_year')}`, 14, y);
        y += 14;

        doc.text(`Surety Company: ${getVal('final_surety_final')}`, 14, y);
        y += 10;
        doc.text(`Signature of Authorized Representative: ____________________`, 14, y);
        y += 7;
        doc.text(`Title: ${getVal('final_title')}`, 14, y);

        doc.save('Consent-FinalPayment.pdf');
        toast({ title: 'Download Started', description: 'Consent for Final Payment PDF is being generated.' });
    };

    return (
         <FormCard title="Consent of Surety Company to Final Payment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input id="final_project_name" placeholder="Project Name" />
                <Input id="final_project_address" placeholder="Project Address" />
                <Input id="final_architect_no" placeholder="Architects Project No" />
                <Input id="final_contract_for" placeholder="Contract For" />
                <Input id="final_contract_date" type="date" />
            </div>
            <Label htmlFor="final_owner_to">To: (Owner)</Label>
            <Textarea id="final_owner_to" placeholder="Owner's Name and Address" />
            <p className="text-sm mt-4">In accordance with the provisions of the Contract between the Owner and the Contractor as indicated above, the</p>
            <Input id="final_surety_name" placeholder="(here insert named and address of Surety Company)" className="my-2" />
            <p>, SURETY COMPANY,</p>
            <p className="text-sm mt-2">On bond of</p>
            <Input id="final_contractor_name" placeholder="(here insert named and address of Contractor)" className="my-2" />
            <p>, CONTRACTOR,</p>
            <p className="text-sm mt-2">Hereby approves the final payment to the Contractor, and agrees that final payment to the Contractor shall not relieve the Surety Company of any of its obligations to</p>
             <Input id="final_owner_name" placeholder="(here insert named and address of Owner)" className="my-2" />
            <p>, OWNER,</p>
            <p className="text-sm mt-2">As set forth in the said Surety's bond.</p>
            <div className="flex items-center gap-2 mt-4">In Witness Whereof, The Surety has hereunto set its hand this day of <Input id="final_day" className="w-24" />, 20 <Input id="final_year" className="w-20" /></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Input id="final_surety_final" placeholder="Surety Company" />
                <Input id="final_title" placeholder="Title" />
            </div>
            <div className="mt-4">Signature of Authorized Representative: ____________________</div>
             <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
            </div>
        </FormCard>
    );
};

export default function Page() {
  const image = PlaceHolderImages.find(p => p.id === 'consent-of-surety');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Consent of Surety"
        description="Manage consent of surety for retainage and final payment."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <div className="space-y-8">
        <RetainageForm />
        <FinalPaymentForm />
      </div>
    </div>
  );
}
