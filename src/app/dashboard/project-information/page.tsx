
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

const InputRow = ({ label, id, value, onChange, placeholder, type = "text" }: { label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; }) => (
    <div className="grid md:grid-cols-3 items-center gap-4">
        <Label htmlFor={id} className="md:text-right">{label}</Label>
        <Input id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} type={type} className="md:col-span-2" />
    </div>
);

const CheckboxRow = ({ label, id, checked, onCheckedChange }: { label: string; id: string; checked: boolean; onCheckedChange: (checked: boolean) => void; }) => (
  <div className="flex items-center space-x-2">
    <Checkbox id={id} name={id} checked={checked} onCheckedChange={onCheckedChange} />
    <Label htmlFor={id} className="font-normal">{label}</Label>
  </div>
);

const ConsultantRow = ({ type, data, onChange }: { type: string; data: any; onChange: (type: string, field: string, value: string) => void; }) => {
    const slug = type.toLowerCase().replace(/ /g, '_');
    return (
        <TableRow>
            <TableCell className="font-medium">{type}</TableCell>
            <TableCell><Input name={`${slug}_basic`} value={data.basic || ''} onChange={(e) => onChange(slug, 'basic', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_additional`} value={data.additional || ''} onChange={(e) => onChange(slug, 'additional', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_architect`} value={data.architect || ''} onChange={(e) => onChange(slug, 'architect', e.target.value)} className="w-full" /></TableCell>
            <TableCell><Input name={`${slug}_owner`} value={data.owner || ''} onChange={(e) => onChange(slug, 'owner', e.target.value)} className="w-full" /></TableCell>
        </TableRow>
    );
};


export default function ProjectInformationPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-information');
    const { toast } = useToast();
    const [formData, setFormData] = useState<Record<string, any>>({
        consultants: {}
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };
    
    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConsultantChange = (type: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            consultants: {
                ...prev.consultants,
                [type]: {
                    ...prev.consultants?.[type],
                    [field]: value
                }
            }
        }));
    };

    const handleSave = () => {
        console.log(formData);
        toast({
            title: "Record Saved",
            description: "The project information has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 22;
        
        const getVal = (id: string) => formData[id] || '';
        const getRadio = (name: string) => formData[name] || 'N/A';
        const getCheckbox = (id: string) => formData[id] || false;
        
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
            ['Project', getVal('project')],
            ['Address', getVal('project_address')],
            ['Project No', getVal('project_no')],
            ['Prepared By', getVal('prepared_by')],
            ['Prepared Date', getVal('prepared_date')],
        ]);
    
        // About Owner
        addTableSection("About Owner", [
            ['Full Name', getVal('owner_name')],
            ['Address (Office)', getVal('owner_office_address')],
            ['Address (Res.)', getVal('owner_res_address')],
            ['Phone (Office)', getVal('owner_office_phone')],
            ['Phone (Res.)', getVal('owner_res_phone')],
            ["Owner's Rep Name", getVal('rep_name')],
            ['Address (Office)', getVal('rep_office_address')],
            ['Address (Res.)', getVal('rep_res_address')],
            ['Phone (Office)', getVal('rep_office_phone')],
            ['Phone (Res.)', getVal('rep_res_phone')],
        ]);

        doc.addPage();
        yPos = 20;
        
        const projectReqs = [
            getCheckbox('reqt_arch') && 'Architectural Designing',
            getCheckbox('reqt_interior') && 'Interior Decoration',
            getCheckbox('reqt_landscaping') && 'Landscaping',
            getCheckbox('reqt_turnkey') && 'Turnkey',
            getCheckbox('reqt_other') && `Other: ${getVal('reqt_other_text') || 'Yes'}`
        ].filter(Boolean).join(', ');

        const projectTypes = [
            getCheckbox('type_commercial') && 'Commercial',
            getCheckbox('type_residential') && 'Residential'
        ].filter(Boolean).join(', ');

        const projectCosts = [
            getCheckbox('cost_arch') && 'Architectural Designing',
            getCheckbox('cost_interior') && 'Interior Decoration',
            getCheckbox('cost_landscaping') && 'Landscaping',
            getCheckbox('cost_construction') && 'Construction',
            getCheckbox('cost_turnkey') && 'Turnkey',
            getCheckbox('cost_other') && `Other: ${getVal('cost_other_text') || 'Yes'}`
        ].filter(Boolean).join(', ');

        addTableSection("About Project", [
            ['Address', getVal('about_project_address')],
            ['Project Reqt.', projectReqs],
            ['Project Type', projectTypes],
            ['Project Status', getRadio('project_status')],
            ['Project Area', getVal('project_area')],
            ['Special Requirements', getVal('special_reqs')],
            ["Project's Cost", projectCosts]
        ]);

        addTableSection("Dates Concerned with Project", [
            ['First Information about Project', getVal('date_first_info')],
            ['First Meeting', getVal('date_first_meeting')],
            ['First Working on Project', getVal('date_first_working')],
            ['First Proposal Start', getVal('date_proposal1_start')],
            ['First Proposal Completion', getVal('date_proposal1_completion')],
            ['Second Proposal Start', getVal('date_proposal2_start')],
            ['Second Proposal Completion', getVal('date_proposal2_completion')],
            ['Working on Finalized Proposal', getVal('date_final_proposal')],
            ['Revised Presentation', getVal('date_revised_presentation')],
            ['Quotation', getVal('date_quotation')],
            ['Drawings Start', getVal('date_drawings_start')],
            ['Drawings Completion', getVal('date_drawings_completion')],
            ['Other Milestones', getVal('other_dates')],
        ]);

        doc.addPage();
        yPos = 20;

        const providedByOwner = [
            getCheckbox('owner_program') && 'Program',
            getCheckbox('owner_schedule') && 'Suggested Schedule',
            getCheckbox('owner_legal') && 'Legal Site Description & Other Concerned Documents',
            getCheckbox('owner_survey') && 'Land Survey Report',
            getCheckbox('owner_geo') && 'Geo-Technical, Tests and Other Site Information',
            getCheckbox('owner_existing_drawings') && "Existing Structure's Drawings"
        ].filter(Boolean).join('\n');

        addTableSection("Provided by Owner", [[providedByOwner]]);

        addTableSection("Compensation", [
            ['Initial Payment', getVal('comp_initial')],
            ['Basic Services (% of Cost)', getVal('comp_basic')],
            ['Schematic Design %', getVal('comp_schematic')],
            ['Design Development %', getVal('comp_dev')],
            ["Construction Doc's %", getVal('comp_docs')],
            ['Bidding / Negotiation %', getVal('comp_bidding')],
            ['Construction Contract Admin %', getVal('comp_admin')],
            ['Additional Services', getVal('comp_additional')],
            ['Reimbursable Expenses', getVal('comp_reimbursable')],
            ['Other', getVal('comp_other')],
            ['Special Confidential Requirements', getVal('confidential_reqs')],
        ]);

        addTableSection("Miscellaneous Notes", [[getVal('misc_notes')]]);
        
        doc.addPage();
        yPos = 20;

        const consultantTypes = ["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"];
        const consultantBody = consultantTypes.map(type => {
            const slug = type.toLowerCase().replace(/ /g, '_');
            return [
                type,
                formData.consultants?.[slug]?.basic || '',
                formData.consultants?.[slug]?.additional || '',
                formData.consultants?.[slug]?.architect || '',
                formData.consultants?.[slug]?.owner || '',
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
            ['Residence', getVal('req_residence')],
            ['Nos.', getVal('req_nos')],
            ['Size of plot', getVal('req_plot_size')],
            ['Number of Bedrooms', getVal('req_bedrooms')],
            ['Specifications', getVal('req_specifications')],
            ['Number of Dressing Rooms', getVal('req_dressing_rooms')],
            ['Number of Bath Rooms', getVal('req_bathrooms')],
            ['Living Rooms', getVal('req_living_rooms')],
            ['Breakfast', getVal('req_breakfast')],
            ['Dinning', getVal('req_dining')],
            ['Servant Kitchen', getVal('req_servant_kitchen')],
            ['Self Kitchenett', getVal('req_self_kitchenette')],
            ['Garage', getVal('req_garage')],
            ['Servant Quarters', getVal('req_servant_quarters')],
            ['Guard Room', getVal('req_guard_room')],
            ['Study Room', getVal('req_study_room')],
            ['Stores', getVal('req_stores')],
            ['Entertainment Area', getVal('req_entertainment')],
            ['Partio', getVal('req_patio')],
            ['Atrium', getVal('req_atrium')],
            ['Remarks', getVal('req_remarks')],
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
                            <InputRow label="Project:" id="project" value={formData['project'] || ''} onChange={handleChange}/>
                            <InputRow label="Address:" id="project_address" value={formData['project_address'] || ''} onChange={handleChange} />
                            <InputRow label="Project No:" id="project_no" value={formData['project_no'] || ''} onChange={handleChange} />
                            <InputRow label="Prepared By:" id="prepared_by" value={formData['prepared_by'] || ''} onChange={handleChange} />
                            <InputRow label="Prepared Date:" id="prepared_date" type="date" value={formData['prepared_date'] || ''} onChange={handleChange} />
                        </Section>

                        <Separator className="my-8" />
                        
                        <Section title="About Owner">
                            <InputRow label="Full Name:" id="owner_name" value={formData['owner_name'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Office):" id="owner_office_address" value={formData['owner_office_address'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Res.):" id="owner_res_address" value={formData['owner_res_address'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Office):" id="owner_office_phone" value={formData['owner_office_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" id="owner_res_phone" value={formData['owner_res_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Owner's Project Representative Name:" id="rep_name" value={formData['rep_name'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Office):" id="rep_office_address" value={formData['rep_office_address'] || ''} onChange={handleChange} />
                            <InputRow label="Address (Res.):" id="rep_res_address" value={formData['rep_res_address'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Office):" id="rep_office_phone" value={formData['rep_office_phone'] || ''} onChange={handleChange} />
                            <InputRow label="Phone (Res.):" id="rep_res_phone" value={formData['rep_res_phone'] || ''} onChange={handleChange} />
                        </Section>

                        <Separator className="my-8" />

                        <Section title="About Project">
                             <InputRow label="Address:" id="about_project_address" value={formData['about_project_address'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Reqt.</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" id="reqt_arch" checked={formData['reqt_arch'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_arch', c)} />
                                     <CheckboxRow label="Interior Decoration" id="reqt_interior" checked={formData['reqt_interior'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_interior', c)} />
                                     <CheckboxRow label="Landscaping" id="reqt_landscaping" checked={formData['reqt_landscaping'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_landscaping', c)} />
                                     <CheckboxRow label="Turnkey" id="reqt_turnkey" checked={formData['reqt_turnkey'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_turnkey', c)} />
                                     <div className="flex items-center gap-2"><Checkbox id="reqt_other" checked={formData['reqt_other'] || false} onCheckedChange={(c) => handleCheckboxChange('reqt_other', c)} /><Label htmlFor="reqt_other">Other</Label><Input name="reqt_other_text" value={formData['reqt_other_text'] || ''} onChange={handleChange} className="h-7"/></div>
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Type:</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Commercial" id="type_commercial" checked={formData['type_commercial'] || false} onCheckedChange={(c) => handleCheckboxChange('type_commercial', c)} />
                                     <CheckboxRow label="Residential" id="type_residential" checked={formData['type_residential'] || false} onCheckedChange={(c) => handleCheckboxChange('type_residential', c)} />
                                 </div>
                             </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project Status</Label>
                                 <RadioGroup name="project_status" value={formData['project_status']} onValueChange={(v) => handleRadioChange('project_status', v)} className="md:col-span-2 space-y-2">
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="new" id="status_new" /><Label htmlFor="status_new" className="font-normal">New</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="addition" id="status_addition" /><Label htmlFor="status_addition" className="font-normal">Addition</Label></div>
                                     <div className="flex items-center space-x-2"><RadioGroupItem value="rehab" id="status_rehab" /><Label htmlFor="status_rehab" className="font-normal">Rehabilitation/Renovation</Label></div>
                                 </RadioGroup>
                             </div>
                             <InputRow label="Project Area:" id="project_area" value={formData['project_area'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="special_reqs" className="md:text-right pt-2">Special Requirments of Project:</Label>
                                <Textarea id="special_reqs" name="special_reqs" value={formData['special_reqs'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                 <Label className="md:text-right pt-2">Project's Cost</Label>
                                 <div className="md:col-span-2 space-y-2">
                                     <CheckboxRow label="Architectural Designing" id="cost_arch" checked={formData['cost_arch'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_arch', c)} />
                                     <CheckboxRow label="Interior Decoration" id="cost_interior" checked={formData['cost_interior'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_interior', c)} />
                                     <CheckboxRow label="Landscaping" id="cost_landscaping" checked={formData['cost_landscaping'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_landscaping', c)} />
                                     <CheckboxRow label="Construction" id="cost_construction" checked={formData['cost_construction'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_construction', c)} />
                                     <CheckboxRow label="Turnkey" id="cost_turnkey" checked={formData['cost_turnkey'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_turnkey', c)} />
                                     <div className="flex items-center gap-2"><Checkbox id="cost_other" checked={formData['cost_other'] || false} onCheckedChange={(c) => handleCheckboxChange('cost_other', c)} /><Label htmlFor="cost_other">Other</Label><Input name="cost_other_text" value={formData['cost_other_text'] || ''} onChange={handleChange} className="h-7"/></div>
                                 </div>
                             </div>
                        </Section>

                        <Section title="Dates Concerned with Project">
                            <InputRow label="First Information about Project:" id="date_first_info" type="date" value={formData['date_first_info'] || ''} onChange={handleChange} />
                            <InputRow label="First Meeting:" id="date_first_meeting" type="date" value={formData['date_first_meeting'] || ''} onChange={handleChange} />
                            <InputRow label="First Working on Project:" id="date_first_working" type="date" value={formData['date_first_working'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">First Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_proposal1_start" type="date" value={formData['date_proposal1_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" id="date_proposal1_completion" type="date" value={formData['date_proposal1_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Second Proposal:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_proposal2_start" type="date" value={formData['date_proposal2_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" id="date_proposal2_completion" type="date" value={formData['date_proposal2_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <InputRow label="Working on Finalized Proposal:" id="date_final_proposal" type="date" value={formData['date_final_proposal'] || ''} onChange={handleChange} />
                            <InputRow label="Revised Presentation:" id="date_revised_presentation" type="date" value={formData['date_revised_presentation'] || ''} onChange={handleChange} />
                            <InputRow label="Quotation:" id="date_quotation" type="date" value={formData['date_quotation'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Drawings:</Label>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <InputRow label="Start" id="date_drawings_start" type="date" value={formData['date_drawings_start'] || ''} onChange={handleChange} />
                                    <InputRow label="Completion" id="date_drawings_completion" type="date" value={formData['date_drawings_completion'] || ''} onChange={handleChange} />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="other_dates" className="md:text-right pt-2">Other Major Projects Milestone Dates:</Label>
                                <Textarea id="other_dates" name="other_dates" value={formData['other_dates'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Provided by Owner">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 md:col-start-2 space-y-2">
                                     <CheckboxRow label="Program" id="owner_program" checked={formData['owner_program'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_program', c)} />
                                     <CheckboxRow label="Suggested Schedule" id="owner_schedule" checked={formData['owner_schedule'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_schedule', c)} />
                                     <CheckboxRow label="Legal Site Description & Other Concerned Documents" id="owner_legal" checked={formData['owner_legal'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_legal', c)} />
                                     <CheckboxRow label="Land Survey Report" id="owner_survey" checked={formData['owner_survey'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_survey', c)} />
                                     <CheckboxRow label="Geo-Technical, Tests and Other Site Information" id="owner_geo" checked={formData['owner_geo'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_geo', c)} />
                                     <CheckboxRow label="Existing Structure's Drawings" id="owner_existing_drawings" checked={formData['owner_existing_drawings'] || false} onCheckedChange={(c) => handleCheckboxChange('owner_existing_drawings', c)} />
                                 </div>
                             </div>
                        </Section>

                        <Section title="Compensation">
                            <InputRow label="Initial Payment:" id="comp_initial" value={formData['comp_initial'] || ''} onChange={handleChange} />
                            <InputRow label="Basic Services (% of Cost of Construction):" id="comp_basic" value={formData['comp_basic'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 items-center gap-4">
                                <Label className="md:text-right">Breakdown by Phase:</Label>
                                <div className="md:col-span-2 space-y-2">
                                    <InputRow label="Schematic Design:" id="comp_schematic" value={formData['comp_schematic'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Design Development:" id="comp_dev" value={formData['comp_dev'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Construction Doc's:" id="comp_docs" value={formData['comp_docs'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Bidding / Negotiation:" id="comp_bidding" value={formData['comp_bidding'] || ''} onChange={handleChange} placeholder="%" />
                                    <InputRow label="Construction Contract Admin:" id="comp_admin" value={formData['comp_admin'] || ''} onChange={handleChange} placeholder="%" />
                                </div>
                            </div>
                             <InputRow label="Additional Services (Multiple of Times Direct Cost to Architect):" id="comp_additional" value={formData['comp_additional'] || ''} onChange={handleChange} />
                             <InputRow label="Reimbursable Expenses:" id="comp_reimbursable" value={formData['comp_reimbursable'] || ''} onChange={handleChange} />
                             <InputRow label="Other:" id="comp_other" value={formData['comp_other'] || ''} onChange={handleChange} />
                             <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="confidential_reqs" className="md:text-right pt-2">Special Confindential Requirements:</Label>
                                <Textarea id="confidential_reqs" name="confidential_reqs" value={formData['confidential_reqs'] || ''} onChange={handleChange} className="md:col-span-2" />
                            </div>
                        </Section>

                        <Section title="Miscellaneous Notes">
                            <Textarea id="misc_notes" name="misc_notes" value={formData['misc_notes'] || ''} onChange={handleChange} className="min-h-[100px]" />
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
                                    {["Structural", "HVAC", "Plumbing", "Electrical", "Civil", "Landscape", "Interior", "Graphics", "Lighting", "Acoustical", "Fire Protection", "Food Service", "Vertical transport", "Display/Exhibit", "Master planning", "Construction Cost", "Other", "...", "...", "Land Surveying", "Geotechnical", "Asbestos", "Hazardous waste"].map((c, index) => <ConsultantRow key={`${c}-${index}`} type={c} data={formData.consultants?.[c.toLowerCase().replace(/ /g, '_')] || {}} onChange={handleConsultantChange}/>)}
                                </TableBody>
                             </Table>
                        </Section>
                        
                        <Section title="Requirements">
                            <InputRow label="Residence:" id="req_residence" value={formData['req_residence'] || ''} onChange={handleChange} />
                            <InputRow label="Nos.:" id="req_nos" value={formData['req_nos'] || ''} onChange={handleChange} />
                            <InputRow label="Size of plot:" id="req_plot_size" value={formData['req_plot_size'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Bedrooms:" id="req_bedrooms" value={formData['req_bedrooms'] || ''} onChange={handleChange} />
                            <InputRow label="Specifications:" id="req_specifications" value={formData['req_specifications'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Dressing Rooms:" id="req_dressing_rooms" value={formData['req_dressing_rooms'] || ''} onChange={handleChange} />
                            <InputRow label="Number of Bath Rooms:" id="req_bathrooms" value={formData['req_bathrooms'] || ''} onChange={handleChange} />
                            <InputRow label="Living Rooms:" id="req_living_rooms" value={formData['req_living_rooms'] || ''} onChange={handleChange} />
                            <InputRow label="Breakfast:" id="req_breakfast" value={formData['req_breakfast'] || ''} onChange={handleChange} />
                            <InputRow label="Dinning:" id="req_dining" value={formData['req_dining'] || ''} onChange={handleChange} />
                            <InputRow label="Servant Kitchen:" id="req_servant_kitchen" value={formData['req_servant_kitchen'] || ''} onChange={handleChange} />
                            <InputRow label="Self Kitchenett:" id="req_self_kitchenette" value={formData['req_self_kitchenette'] || ''} onChange={handleChange} />
                            <InputRow label="Garage:" id="req_garage" value={formData['req_garage'] || ''} onChange={handleChange} />
                            <InputRow label="Servant Quarters:" id="req_servant_quarters" value={formData['req_servant_quarters'] || ''} onChange={handleChange} />
                            <InputRow label="Guard Room:" id="req_guard_room" value={formData['req_guard_room'] || ''} onChange={handleChange} />
                            <InputRow label="Study Room:" id="req_study_room" value={formData['req_study_room'] || ''} onChange={handleChange} />
                            <InputRow label="Stores:" id="req_stores" value={formData['req_stores'] || ''} onChange={handleChange} />
                            <InputRow label="Entertainment Area:" id="req_entertainment" value={formData['req_entertainment'] || ''} onChange={handleChange} />
                            <InputRow label="Partio:" id="req_patio" value={formData['req_patio'] || ''} onChange={handleChange} />
                            <InputRow label="Atrium:" id="req_atrium" value={formData['req_atrium'] || ''} onChange={handleChange} />
                            <div className="grid md:grid-cols-3 gap-4">
                                <Label htmlFor="req_remarks" className="md:text-right pt-2">Remarks:</Label>
                                <Textarea id="req_remarks" name="req_remarks" value={formData['req_remarks'] || ''} onChange={handleChange} className="md:col-span-2" />
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

