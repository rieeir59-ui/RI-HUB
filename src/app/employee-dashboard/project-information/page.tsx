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
        <TableCell><Checkbox name={`${type.toLowerCase().replace(/ /g, '_')}_basic`} /></TableCell>
        <TableCell><Checkbox name={`${type.toLowerCase().replace(/ /g, '_')}_additional`} /></TableCell>
        <TableCell><Checkbox name={`${type.toLowerCase().replace(/ /g, '_')}_architect`} /></TableCell>
        <TableCell><Checkbox name={`${type.toLowerCase().replace(/ /g, '_')}_owner`} /></TableCell>
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

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 22;
        const lineSpacing = 8;
        const labelX = margin;
        const valueX = 65;
        const lineXEnd = pageWidth - margin;

        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PROJECT INFORMATION', pageWidth / 2, yPos, { align: 'center' });
        yPos += 18;

        const addLine = () => doc.line(valueX, yPos - 1, lineXEnd, yPos - 1);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        // Project Information
        doc.text('Project:', labelX, yPos);
        doc.text(getInputValue('project'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Address:', labelX, yPos);
        doc.text(getInputValue('project_address'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Project No:', labelX, yPos);
        doc.text(getInputValue('project_no'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text('Prepared By:', labelX, yPos);
        doc.text(getInputValue('prepared_by'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Prepared Date:', labelX, yPos);
        doc.text(getInputValue('prepared_date'), valueX, yPos);
        addLine();
        yPos += lineSpacing + 2;

        doc.setLineDash([1, 1], 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineDash([], 0);
        yPos += lineSpacing;

        // About Owner
        doc.setFont('helvetica', 'bold');
        doc.text('About Owner:', labelX, yPos);
        yPos += lineSpacing;

        doc.setFont('helvetica', 'normal');
        doc.text('Full Name:', labelX, yPos);
        doc.text(getInputValue('owner_name'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text('Address (Office):', labelX, yPos);
        doc.text(getInputValue('owner_office_address'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Address (Res.):', labelX, yPos);
        doc.text(getInputValue('owner_res_address'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Phone (Office):', labelX, yPos);
        doc.text(getInputValue('owner_office_phone'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text('Phone (Res.):', labelX, yPos);
        doc.text(getInputValue('owner_res_phone'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text("Owner's Project Representative Name:", labelX, yPos);
        doc.text(getInputValue('rep_name'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text('Address (Office):', labelX, yPos);
        doc.text(getInputValue('rep_office_address'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Address (Res.):', labelX, yPos);
        doc.text(getInputValue('rep_res_address'), valueX, yPos);
        addLine();
        yPos += lineSpacing;

        doc.text('Phone (Office):', labelX, yPos);
        doc.text(getInputValue('rep_office_phone'), valueX, yPos);
        addLine();
        yPos += lineSpacing;
        
        doc.text('Phone (Res.):', labelX, yPos);
        doc.text(getInputValue('rep_res_phone'), valueX, yPos);
        addLine();
        yPos += lineSpacing + 2;

        doc.setLineDash([1, 1], 0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        doc.setLineDash([], 0);
        yPos += lineSpacing;

        doc.save('project-information.pdf');
        toast({
            title: "PDF Downloaded",
            description: "The project information has been downloaded as a PDF.",
        });
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
                            <InputRow label="First Information:" id="date_first_information" type="date" />
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
                                    {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Solar", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map((c, index) => <ConsultantRow key={`${c}-${index}`} type={c} />)}
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
