'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, id, placeholder }: { label: string; id: string; placeholder?: string; }) => (
    <div className="grid md:grid-cols-3 items-center gap-4">
        <Label htmlFor={id} className="md:text-right">{label}</Label>
        <Input id={id} name={id} placeholder={placeholder} className="md:col-span-2" />
    </div>
);

const CheckboxRow = ({ label, id }: { label: string; id: string }) => (
  <div className="flex items-center space-x-2">
    <Checkbox id={id} name={id} />
    <Label htmlFor={id} className="font-normal">{label}</Label>
  </div>
);

export default function ProjectInformationPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-information');
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Record Saved",
            description: "The project information has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        const form = document.getElementById('project-info-form');
        if (form) {
            const formData = new FormData(form as HTMLFormElement);
            const data: Record<string, string | string[]> = {};
            
            formData.forEach((value, key) => {
                 if (data[key]) {
                    if (Array.isArray(data[key])) {
                       (data[key] as string[]).push(value.toString());
                    } else {
                        data[key] = [data[key] as string, value.toString()];
                    }
                } else {
                    data[key] = value.toString();
                }
            });

            let y = 20;
            doc.setFontSize(16);
            doc.text("Project Information", 14, y);
            y += 10;

            doc.setFontSize(12);

            const addSection = (title: string, fields: {label: string, key: string}[]) => {
                y+= 5;
                doc.setFontSize(14);
                doc.text(title, 14, y);
                y += 8;
                doc.setFontSize(10);
                fields.forEach(field => {
                    const value = data[field.key] || 'N/A';
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`${field.label}:`, 20, y);
                    doc.text(Array.isArray(value) ? value.join(', ') : value, 80, y);
                    y += 7;
                });
            }

            addSection("Project Information", [
                {label: 'Project', key: 'project'},
                {label: 'Address', key: 'project_address'},
                {label: 'Project No', key: 'project_no'},
                {label: 'Prepared By', key: 'prepared_by'},
                {label: 'Prepared Date', key: 'prepared_date'},
            ]);

            addSection("About Owner", [
                 {label: 'Full Name', key: 'owner_name'},
                 {label: 'Address (Office)', key: 'owner_office_address'},
                 {label: 'Address (Res.)', key: 'owner_res_address'},
                 {label: 'Phone (Office)', key: 'owner_office_phone'},
                 {label: 'Phone (Res.)', key: 'owner_res_phone'},
                 {label: "Owner's Rep. Name", key: 'rep_name'},
                 {label: 'Rep. Address (Office)', key: 'rep_office_address'},
                 {label: 'Rep. Address (Res.)', key: 'rep_res_address'},
                 {label: 'Rep. Phone (Office)', key: 'rep_office_phone'},
                 {label: 'Rep. Phone (Res.)', key: 'rep_res_phone'},
            ]);
            
            toast({
                title: "PDF Downloaded",
                description: "The project information has been downloaded as a PDF.",
            });
            doc.save('project-information.pdf');
        } else {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not find form data to generate PDF.",
            });
        }
    };
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Information"
                description="View and manage project information."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="project-info-form">
                        <Section title="PROJECT INFORMATION">
                            <InputRow label="Project:" id="project" />
                            <InputRow label="Address:" id="project_address" />
                            <InputRow label="Project No:" id="project_no" />
                            <InputRow label="Prepared By:" id="prepared_by" />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label htmlFor="prepared_date" className="md:text-right">Prepared Date:</Label>
                                <Input id="prepared_date" name="prepared_date" type="date" className="md:col-span-2" />
                            </div>
                        </Section>

                        <Separator className="my-8" />
                        
                        <Section title="About Owner">
                            <InputRow label="Full Name:" id="owner_name" />
                            <InputRow label="Address (Office):" id="owner_office_address" />
                            <InputRow label="Address (Res.):" id="owner_res_address" />
                            <InputRow label="Phone (Office):" id="owner_office_phone" />
                            <InputRow label="Phone (Res.):" id="owner_res_phone" />
                            <InputRow label="Owner's Project Representative Name:" id="rep_name" />
                            <InputRow label="Address (Office):" id="rep_office_address" />
                            <InputRow label="Address (Res.):" id="rep_res_address" />
                            <InputRow label="Phone (Office):" id="rep_office_phone" />
                            <InputRow label="Phone (Res.):" id="rep_res_phone" />
                        </Section>

                        <Separator className="my-8" />

                        <Section title="About Project">
                             <InputRow label="Address:" id="about_project_address" />
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Reqt.</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" id="reqt_arch" />
                                     <CheckboxRow label="Interior Decoration" id="reqt_interior" />
                                     <CheckboxRow label="Landscaping" id="reqt_landscaping" />
                                     <CheckboxRow label="Turnkey" id="reqt_turnkey" />
                                     <CheckboxRow label="Other" id="reqt_other" />
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Type:</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Commercial" id="type_commercial" />
                                     <CheckboxRow label="Residential" id="type_residential" />
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Status</Label>
                                 <RadioGroup className="md:col-span-2 space-y-2">
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="new" id="status_new" /><Label htmlFor="status_new" className="font-normal">New</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="addition" id="status_addition" /><Label htmlFor="status_addition" className="font-normal">Addition</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="rehab" id="status_rehab" /><Label htmlFor="status_rehab" className="font-normal">Rehabilitation/Renovation</Label></div>
                                 </RadioGroup>
                             </div>
                             <InputRow label="Project Area:" id="project_area" />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="special_reqs" className="md:text-right pt-2">Special Requirments of Project:</Label>
                                <Textarea id="special_reqs" name="special_reqs" className="md:col-span-2" />
                            </div>
                        </Section>
                        
                        <div className="flex justify-end gap-4 mt-12">
                            <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                            <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
