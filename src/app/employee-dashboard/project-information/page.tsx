
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from '@/components/ui/card';
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

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, id, placeholder, type = "text" }: { label: string; id: string; placeholder?: string; type?: string; }) => (
    <div className="grid md:grid-cols-3 items-center gap-4">
        <Label htmlFor={id} className="md:text-right">{label}</Label>
        <Input id={id} name={id} placeholder={placeholder} type={type} className="md:col-span-2" />
    </div>
);

const CheckboxRow = ({ label, id }: { label: string; id: string }) => (
  <div className="flex items-center space-x-2">
    <Checkbox id={id} name={id} />
    <Label htmlFor={id} className="font-normal">{label}</Label>
  </div>
);

const ConsultantRow = ({ type }: { type: string }) => (
    <TableRow>
        <TableCell className="font-medium">{type}</TableCell>
        <TableCell><Input name={`${type.toLowerCase().replace(/ /g, '_')}_basic`} className="w-full" /></TableCell>
        <TableCell><Input name={`${type.toLowerCase().replace(/ /g, '_')}_additional`} className="w-full" /></TableCell>
        <TableCell><Input name={`${type.toLowerCase().replace(/ /g, '_')}_architect`} className="w-full" /></TableCell>
        <TableCell><Input name={`${type.toLowerCase().replace(/ /g, '_')}_owner`} className="w-full" /></TableCell>
    </TableRow>
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
        const form = document.getElementById('project-info-form') as HTMLFormElement;
        if (!form) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not find form data to generate PDF.",
            });
            return;
        }
    
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 22;
        
        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';
        const getCheckboxValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.checked;
        const getRadioValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || '';
        
        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, margin, yPos);
            yPos += 8;
        };
    
        const addKeyValuePair = (label: string, value: string, indent = 0) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(label, margin + indent, yPos);
            doc.setFont('helvetica', 'normal');
            const splitValue = doc.splitTextToSize(value, pageWidth - margin * 2 - (50 + indent));
            doc.text(splitValue, margin + 50 + indent, yPos);
            yPos += (splitValue.length * 5) + 2;
        };

        const addCheckboxGroup = (label: string, items: {label: string, id: string}[]) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            yPos += 7;
            items.forEach(item => {
                if(getCheckboxValue(item.id)) {
                    if (yPos > 270) { doc.addPage(); yPos = 20; }
                    doc.setFont('helvetica', 'normal');
                    doc.text(`- ${item.label}`, margin + 5, yPos);
                    yPos += 6;
                }
            });
            yPos += 3;
        }

        const addRadioGroup = (label: string, name: string, options: {label: string, value: string}[]) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            const selectedValue = getRadioValue(name);
            const selectedOption = options.find(opt => opt.value === selectedValue);
             doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            if (selectedOption) {
                doc.setFont('helvetica', 'normal');
                doc.text(selectedOption.label, margin + 50, yPos);
            }
            yPos += 7;
        }

        const addTextArea = (label: string, id: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            const text = getInputValue(id);
            const splitText = doc.splitTextToSize(text, pageWidth - margin * 2 - 5);
            doc.text(splitText, margin + 5, yPos);
            yPos += (splitText.length * 5) + 5;
        }

        const addSeparator = () => {
             if (yPos > 270) { doc.addPage(); yPos = 20; }
             doc.setLineDash([1,1], 0);
             doc.line(margin, yPos, pageWidth - margin, yPos);
             doc.setLineDash([], 0);
             yPos += 8;
        }
    
        // Main Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('REQUIREMENT PERFORMA FOR RESIDENTIAL AND COMMERCIAL', pageWidth / 2, 15, { align: 'center' });
    
        // Project Information
        addSectionTitle("PROJECT INFORMATION");
        addKeyValuePair('Project:', getInputValue('project'));
        addKeyValuePair('Address:', getInputValue('project_address'));
        addKeyValuePair('Project No:', getInputValue('project_no'));
        addKeyValuePair('Prepared By:', getInputValue('prepared_by'));
        addKeyValuePair('Prepared Date:', getInputValue('prepared_date'));
        addSeparator();
    
        // About Owner
        addSectionTitle("About Owner");
        addKeyValuePair('Full Name:', getInputValue('owner_name'));
        addKeyValuePair('Address (Office):', getInputValue('owner_office_address'));
        addKeyValuePair('Address (Res.):', getInputValue('owner_res_address'));
        addKeyValuePair('Phone (Office):', getInputValue('owner_office_phone'));
        addKeyValuePair('Phone (Res.):', getInputValue('owner_res_phone'));
        addKeyValuePair("Owner's Rep Name:", getInputValue('rep_name'));
        addKeyValuePair('Address (Office):', getInputValue('rep_office_address'));
        addKeyValuePair('Address (Res.):', getInputValue('rep_res_address'));
        addKeyValuePair('Phone (Office):', getInputValue('rep_office_phone'));
        addKeyValuePair('Phone (Res.):', getInputValue('rep_res_phone'));
        addSeparator();
    
        // About Project
        addSectionTitle("About Project");
        addKeyValuePair('Address:', getInputValue('about_project_address'));
        addCheckboxGroup('Project Reqt.:', [
            {label: "Architectural Designing", id: "reqt_arch"}, {label: "Interior Decoration", id: "reqt_interior"},
            {label: "Landscaping", id: "reqt_landscaping"}, {label: "Turnkey", id: "reqt_turnkey"}, {label: "Other", id: "reqt_other"}
        ]);
        addCheckboxGroup('Project Type:', [
            {label: "Commercial", id: "type_commercial"}, {label: "Residential", id: "type_residential"}
        ]);
        addRadioGroup('Project Status:', 'project_status', [
             {label: "New", value: "new"}, {label: "Addition", value: "addition"}, {label: "Rehabilitation/Renovation", value: "rehab"}
        ]);
        addKeyValuePair('Project Area:', getInputValue('project_area'));
        addTextArea("Special Requirments of Project:", 'special_reqs');
        addCheckboxGroup("Project's Cost:", [
            {label: "Architectural Designing", id: "cost_arch"}, {label: "Interior Decoration", id: "cost_interior"},
            {label: "Landscaping", id: "cost_landscaping"}, {label: "Construction", id: "cost_construction"},
            {label: "Turnkey", id: "cost_turnkey"}, {label: "Other", id: "cost_other"}
        ]);
        addSeparator();
    
        // Dates
        addSectionTitle("Dates Concerned with Project");
        addKeyValuePair('First Information about Project:', getInputValue('date_first_info'));
        addKeyValuePair('First Meeting:', getInputValue('date_first_meeting'));
        addKeyValuePair('First Working on Project:', getInputValue('date_first_working'));
        addKeyValuePair('First Proposal Start:', getInputValue('date_proposal1_start'));
        addKeyValuePair('First Proposal Completion:', getInputValue('date_proposal1_completion'));
        addKeyValuePair('Second Proposal Start:', getInputValue('date_proposal2_start'));
        addKeyValuePair('Second Proposal Completion:', getInputValue('date_proposal2_completion'));
        addKeyValuePair('Working on Finalized Proposal:', getInputValue('date_final_proposal'));
        addKeyValuePair('Revised Presentation:', getInputValue('date_revised_presentation'));
        addKeyValuePair('Quotation:', getInputValue('date_quotation'));
        addKeyValuePair('Drawings Start:', getInputValue('date_drawings_start'));
        addKeyValuePair('Drawings Completion:', getInputValue('date_drawings_completion'));
        addTextArea('Other Major Projects Milestone Dates:', 'other_dates');
        addSeparator();

        // Provided by Owner
        addSectionTitle("Provided by Owner");
         addCheckboxGroup('', [
            {label: "Program", id: "owner_program"}, {label: "Suggested Schedule", id: "owner_schedule"},
            {label: "Legal Site Description & Other Concerned Documents", id: "owner_legal"},
            {label: "Land Survey Report", id: "owner_survey"}, {label: "Geo-Technical, Tests and Other Site Information", id: "owner_geo"},
            {label: "Existing Structure's Drawings", id: "owner_existing_drawings"}
        ]);
        addSeparator();
    
        // Compensation
        addSectionTitle("Compensation");
        addKeyValuePair('Initial Payment:', getInputValue('comp_initial'));
        addKeyValuePair('Basic Services (% of Cost):', getInputValue('comp_basic'));
        addKeyValuePair('Schematic Design %:', getInputValue('comp_schematic'));
        addKeyValuePair('Design Development %:', getInputValue('comp_dev'));
        addKeyValuePair("Construction Doc's %:", getInputValue('comp_docs'));
        addKeyValuePair('Bidding / Negotiation %:', getInputValue('comp_bidding'));
        addKeyValuePair('Construction Contract Admin %:', getInputValue('comp_admin'));
        addKeyValuePair('Additional Services:', getInputValue('comp_additional'));
        addKeyValuePair('Reimbursable Expenses:', getInputValue('comp_reimbursable'));
        addKeyValuePair('Other:', getInputValue('comp_other'));
        addTextArea('Special Confidential Requirements:', 'confidential_reqs');
        addSeparator();

        // Miscellaneous Notes
        addSectionTitle("Miscellaneous Notes");
        addTextArea('', 'misc_notes');
        addSeparator();

        // Consultants Table
        addSectionTitle("Consultants");
        const consultantTypes = ["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"];
        const head = [['Type', 'Within Basic Fee', 'Additional Fee', 'Architect', 'Owner']];
        const body = consultantTypes.map(type => {
            const slug = type.toLowerCase().replace(/ /g, '_');
            return [
                type,
                getInputValue(`${slug}_basic`),
                getInputValue(`${slug}_additional`),
                getInputValue(`${slug}_architect`),
                getInputValue(`${slug}_owner`),
            ];
        });
        doc.autoTable({
            head: head,
            body: body,
            startY: yPos,
            styles: { halign: 'left', fontSize: 8 },
            headStyles: { fillColor: [45, 95, 51], textColor: 255, fontStyle: 'bold' }
        });
        yPos = doc.autoTable.previous.finalY + 10;
        addSeparator();

        // Requirements
        addSectionTitle("Requirements");
        addKeyValuePair('Residence:', getInputValue('req_residence'));
        addKeyValuePair('Nos.:', getInputValue('req_nos'));
        addKeyValuePair('Size of plot:', getInputValue('req_plot_size'));
        addKeyValuePair('Number of Bedrooms:', getInputValue('req_bedrooms'));
        addKeyValuePair('Specifications:', getInputValue('req_specifications'));
        addKeyValuePair('Number of Dressing Rooms:', getInputValue('req_dressing_rooms'));
        addKeyValuePair('Number of Bath Rooms:', getInputValue('req_bathrooms'));
        addKeyValuePair('Living Rooms:', getInputValue('req_living_rooms'));
        addKeyValuePair('Breakfast:', getInputValue('req_breakfast'));
        addKeyValuePair('Dinning:', getInputValue('req_dining'));
        addKeyValuePair('Servant Kitchen:', getInputValue('req_servant_kitchen'));
        addKeyValuePair('Self Kitchenett:', getInputValue('req_self_kitchenette'));
        addKeyValuePair('Garage:', getInputValue('req_garage'));
        addKeyValuePair('Servant Quarters:', getInputValue('req_servant_quarters'));
        addKeyValuePair('Guard Room:', getInputValue('req_guard_room'));
        addKeyValuePair('Study Room:', getInputValue('req_study_room'));
        addKeyValuePair('Stores:', getInputValue('req_stores'));
        addKeyValuePair('Entertainment Area:', getInputValue('req_entertainment'));
        addKeyValuePair('Partio:', getInputValue('req_patio'));
        addKeyValuePair('Atrium:', getInputValue('req_atrium'));
        addTextArea('Remarks:', 'req_remarks');
        
        doc.save('project-information.pdf');
        toast({
            title: "PDF Downloaded",
            description: "The project information has been downloaded as a PDF.",
        });
    };
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Requirement Performa for Residential and Commercial"
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
                            <InputRow label="Prepared Date:" id="prepared_date" type="date" />
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
                                 <RadioGroup name="project_status" className="md:col-span-2 space-y-2">
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
                            <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project's Cost</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" id="cost_arch" />
                                     <CheckboxRow label="Interior Decoration" id="cost_interior" />
                                     <CheckboxRow label="Landscaping" id="cost_landscaping" />
                                     <CheckboxRow label="Construction" id="cost_construction" />
                                     <CheckboxRow label="Turnkey" id="cost_turnkey" />
                                     <CheckboxRow label="Other" id="cost_other" />
                                 </div>
                             </div>
                        </Section>

                        <Section title="Dates Concerned with Project">
                            <InputRow label="First Information about Project:" id="date_first_info" type="date" />
                            <InputRow label="First Meeting:" id="date_first_meeting" type="date" />
                            <InputRow label="First Working on Project:" id="date_first_working" type="date" />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">First Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_proposal1_start" type="date" />
                                    <InputRow label="Completion" id="date_proposal1_completion" type="date" />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Second Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_proposal2_start" type="date" />
                                    <InputRow label="Completion" id="date_proposal2_completion" type="date" />
                                </div>
                            </div>
                            <InputRow label="Working on Finalized Proposal:" id="date_final_proposal" type="date" />
                            <InputRow label="Revised Presentation:" id="date_revised_presentation" type="date" />
                            <InputRow label="Quotation:" id="date_quotation" type="date" />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Drawings:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_drawings_start" type="date" />
                                    <InputRow label="Completion" id="date_drawings_completion" type="date" />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="other_dates" className="md:text-right pt-2">Other Major Projects Milestone Dates:</Label>
                                <Textarea id="other_dates" name="other_dates" className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Provided by Owner">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 md:col-start-2 space-y-2">
                                     <CheckboxRow label="Program" id="owner_program" />
                                     <CheckboxRow label="Suggested Schedule" id="owner_schedule" />
                                     <CheckboxRow label="Legal Site Description & Other Concerned Documents" id="owner_legal" />
                                     <CheckboxRow label="Land Survey Report" id="owner_survey" />
                                     <CheckboxRow label="Geo-Technical, Tests and Other Site Information" id="owner_geo" />
                                     <CheckboxRow label="Existing Structure's Drawings" id="owner_existing_drawings" />
                                 </div>
                             </div>
                        </Section>

                        <Section title="Compensation">
                            <InputRow label="Initial Payment:" id="comp_initial" />
                            <InputRow label="Basic Services (% of Cost of Construction):" id="comp_basic" />
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Breakdown by Phase:</Label>
                                <div className="md:col-span-2 space-y-2">
                                    <InputRow label="Schematic Design:" id="comp_schematic" placeholder="%" />
                                    <InputRow label="Design Development:" id="comp_dev" placeholder="%" />
                                    <InputRow label="Construction Doc's:" id="comp_docs" placeholder="%" />
                                    <InputRow label="Bidding / Negotiation:" id="comp_bidding" placeholder="%" />
                                    <InputRow label="Construction Contract Admin:" id="comp_admin" placeholder="%" />
                                </div>
                            </div>
                             <InputRow label="Additional Services (Multiple of Times Direct Cost to Architect):" id="comp_additional" />
                             <InputRow label="Reimbursable Expenses:" id="comp_reimbursable" />
                             <InputRow label="Other:" id="comp_other" />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="confidential_reqs" className="md:text-right pt-2">Special Confindential Requirements:</Label>
                                <Textarea id="confidential_reqs" name="confidential_reqs" className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Miscellaneous Notes">
                            <Textarea id="misc_notes" name="misc_notes" className="min-h-[100px]" />
                        </Section>

                        <Section title="Consultants">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Within Basic Fee</TableHead>
                                        <TableHead>Additional Fee</TableHead>
                                        <TableHead>Architect</TableHead>
                                        <TableHead>Owner</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map((c, index) => <ConsultantRow key={`${c}-${index}`} type={c} />)}
                                </TableBody>
                             </Table>
                        </Section>
                        
                        <Section title="Requirements">
                            <InputRow label="Residence:" id="req_residence" />
                            <InputRow label="Nos.:" id="req_nos" />
                            <InputRow label="Size of plot:" id="req_plot_size" />
                            <InputRow label="Number of Bedrooms:" id="req_bedrooms" />
                            <InputRow label="Specifications:" id="req_specifications" />
                            <InputRow label="Number of Dressing Rooms:" id="req_dressing_rooms" />
                            <InputRow label="Number of Bath Rooms:" id="req_bathrooms" />
                            <InputRow label="Living Rooms:" id="req_living_rooms" />
                            <InputRow label="Breakfast:" id="req_breakfast" />
                            <InputRow label="Dinning:" id="req_dining" />
                            <InputRow label="Servant Kitchen:" id="req_servant_kitchen" />
                            <InputRow label="Self Kitchenett:" id="req_self_kitchenette" />
                            <InputRow label="Garage:" id="req_garage" />
                            <InputRow label="Servant Quarters:" id="req_servant_quarters" />
                            <InputRow label="Guard Room:" id="req_guard_room" />
                            <InputRow label="Study Room:" id="req_study_room" />
                            <InputRow label="Stores:" id="req_stores" />
                            <InputRow label="Entertainment Area:" id="req_entertainment" />
                            <InputRow label="Partio:" id="req_patio" />
                            <InputRow label="Atrium:" id="req_atrium" />
                            <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="req_remarks" className="md:text-right pt-2">Remarks:</Label>
                                <Textarea id="req_remarks" name="req_remarks" className="md:col-span-2" />
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
