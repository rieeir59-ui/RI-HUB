
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
        let yPos = 22;
        
        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || 'N/A';
        const getCheckboxValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.checked;
        const getRadioValue = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || 'N/A';
        
        const addTableSection = (title: string, data: (string|string[])[][]) => {
             if (yPos > 250) { doc.addPage(); yPos = 20; }
             doc.autoTable({
                head: [[title]],
                body: data,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [45, 95, 51], fontStyle: 'bold' },
             });
             yPos = (doc as any).lastAutoTable.finalY + 10;
        }
    
        // Main Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('REQUIREMENT PERFORMA FOR RESIDENTIAL AND COMMERCIAL', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
        // Project Information
        addTableSection("PROJECT INFORMATION", [
            ['Project', getInputValue('project')],
            ['Address', getInputValue('project_address')],
            ['Project No', getInputValue('project_no')],
            ['Prepared By', getInputValue('prepared_by')],
            ['Prepared Date', getInputValue('prepared_date')],
        ]);
    
        // About Owner
        addTableSection("About Owner", [
            ['Full Name', getInputValue('owner_name')],
            ['Address (Office)', getInputValue('owner_office_address')],
            ['Address (Res.)', getInputValue('owner_res_address')],
            ['Phone (Office)', getInputValue('owner_office_phone')],
            ['Phone (Res.)', getInputValue('owner_res_phone')],
            ["Owner's Rep Name", getInputValue('rep_name')],
            ['Address (Office)', getInputValue('rep_office_address')],
            ['Address (Res.)', getInputValue('rep_res_address')],
            ['Phone (Office)', getInputValue('rep_office_phone')],
            ['Phone (Res.)', getInputValue('rep_res_phone')],
        ]);

        doc.addPage();
        yPos = 20;
        
        const projectReqs = [
            getCheckboxValue('reqt_arch') && 'Architectural Designing',
            getCheckboxValue('reqt_interior') && 'Interior Decoration',
            getCheckboxValue('reqt_landscaping') && 'Landscaping',
            getCheckboxValue('reqt_turnkey') && 'Turnkey',
            getCheckboxValue('reqt_other') && `Other: ${getInputValue('reqt_other_text') || 'Yes'}`
        ].filter(Boolean).join(', ');

        const projectTypes = [
            getCheckboxValue('type_commercial') && 'Commercial',
            getCheckboxValue('type_residential') && 'Residential'
        ].filter(Boolean).join(', ');

        const projectCosts = [
            getCheckboxValue('cost_arch') && 'Architectural Designing',
            getCheckboxValue('cost_interior') && 'Interior Decoration',
            getCheckboxValue('cost_landscaping') && 'Landscaping',
            getCheckboxValue('cost_construction') && 'Construction',
            getCheckboxValue('cost_turnkey') && 'Turnkey',
            getCheckboxValue('cost_other') && `Other: ${getInputValue('cost_other_text') || 'Yes'}`
        ].filter(Boolean).join(', ');


        // About Project
        addTableSection("About Project", [
            ['Address', getInputValue('about_project_address')],
            ['Project Reqt.', projectReqs],
            ['Project Type', projectTypes],
            ['Project Status', getRadioValue('project_status')],
            ['Project Area', getInputValue('project_area')],
            ['Special Requirements', getInputValue('special_reqs')],
            ["Project's Cost", projectCosts]
        ]);

        addTableSection("Dates Concerned with Project", [
            ['First Information about Project', getInputValue('date_first_info')],
            ['First Meeting', getInputValue('date_first_meeting')],
            ['First Working on Project', getInputValue('date_first_working')],
            ['First Proposal Start', getInputValue('date_proposal1_start')],
            ['First Proposal Completion', getInputValue('date_proposal1_completion')],
            ['Second Proposal Start', getInputValue('date_proposal2_start')],
            ['Second Proposal Completion', getInputValue('date_proposal2_completion')],
            ['Working on Finalized Proposal', getInputValue('date_final_proposal')],
            ['Revised Presentation', getInputValue('date_revised_presentation')],
            ['Quotation', getInputValue('date_quotation')],
            ['Drawings Start', getInputValue('date_drawings_start')],
            ['Drawings Completion', getInputValue('date_drawings_completion')],
            ['Other Milestones', getInputValue('other_dates')],
        ]);

        doc.addPage();
        yPos = 20;

        const providedByOwner = [
            getCheckboxValue('owner_program') && 'Program',
            getCheckboxValue('owner_schedule') && 'Suggested Schedule',
            getCheckboxValue('owner_legal') && 'Legal Site Description & Other Concerned Documents',
            getCheckboxValue('owner_survey') && 'Land Survey Report',
            getCheckboxValue('owner_geo') && 'Geo-Technical, Tests and Other Site Information',
            getCheckboxValue('owner_existing_drawings') && "Existing Structure's Drawings"
        ].filter(Boolean).join('\n');

        addTableSection("Provided by Owner", [
            [providedByOwner]
        ]);

        addTableSection("Compensation", [
            ['Initial Payment', getInputValue('comp_initial')],
            ['Basic Services (% of Cost)', getInputValue('comp_basic')],
            ['Schematic Design %', getInputValue('comp_schematic')],
            ['Design Development %', getInputValue('comp_dev')],
            ["Construction Doc's %", getInputValue('comp_docs')],
            ['Bidding / Negotiation %', getInputValue('comp_bidding')],
            ['Construction Contract Admin %', getInputValue('comp_admin')],
            ['Additional Services', getInputValue('comp_additional')],
            ['Reimbursable Expenses', getInputValue('comp_reimbursable')],
            ['Other', getInputValue('comp_other')],
            ['Special Confidential Requirements', getInputValue('confidential_reqs')],
        ]);

        addTableSection("Miscellaneous Notes", [[getInputValue('misc_notes')]]);
        
        doc.addPage();
        yPos = 20;

        const consultantTypes = ["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"];
        const consultantBody = consultantTypes.map(type => {
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
            head: [['Type', 'Within Basic Fee', 'Additional Fee', 'Architect', 'Owner']],
            body: consultantBody,
            startY: yPos,
            styles: { halign: 'left', fontSize: 8 },
            headStyles: { fillColor: [45, 95, 51], textColor: 255, fontStyle: 'bold' }
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
        
        addTableSection("Requirements", [
            ['Residence', getInputValue('req_residence')],
            ['Nos.', getInputValue('req_nos')],
            ['Size of plot', getInputValue('req_plot_size')],
            ['Number of Bedrooms', getInputValue('req_bedrooms')],
            ['Specifications', getInputValue('req_specifications')],
            ['Number of Dressing Rooms', getInputValue('req_dressing_rooms')],
            ['Number of Bath Rooms', getInputValue('req_bathrooms')],
            ['Living Rooms', getInputValue('req_living_rooms')],
            ['Breakfast', getInputValue('req_breakfast')],
            ['Dinning', getInputValue('req_dining')],
            ['Servant Kitchen', getInputValue('req_servant_kitchen')],
            ['Self Kitchenett', getInputValue('req_self_kitchenette')],
            ['Garage', getInputValue('req_garage')],
            ['Servant Quarters', getInputValue('req_servant_quarters')],
            ['Guard Room', getInputValue('req_guard_room')],
            ['Study Room', getInputValue('req_study_room')],
            ['Stores', getInputValue('req_stores')],
            ['Entertainment Area', getInputValue('req_entertainment')],
            ['Partio', getInputValue('req_patio')],
            ['Atrium', getInputValue('req_atrium')],
            ['Remarks', getInputValue('req_remarks')],
        ]);

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
                                     <div className="flex items-center gap-2"><Checkbox id="reqt_other" /><Label htmlFor="reqt_other">Other</Label><Input name="reqt_other_text" className="h-7"/></div>
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
                                     <div className="flex items-center gap-2"><Checkbox id="cost_other" /><Label htmlFor="cost_other">Other</Label><Input name="cost_other_text" className="h-7"/></div>
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
