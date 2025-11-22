
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const SectionTable = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-primary mb-3 pb-2 border-b-2 border-primary">{title}</h2>
        <Table>
            <TableBody>
                {children}
            </TableBody>
        </Table>
    </div>
);

const FormRow = ({ label, children }: { label: string; children: React.ReactNode; }) => (
    <TableRow>
        <TableCell className="font-semibold w-1/3">{label}</TableCell>
        <TableCell>{children}</TableCell>
    </TableRow>
);


const checklistItems = [
    { no: 1, title: 'Existing Plan' },
    { no: 2, title: 'Site Plan' },
    { no: 3, title: 'Basement Plan' },
    { no: 4, title: 'Ground Floor Plan' },
    { no: 5, title: 'First Floor Plan' },
    { no: 6, title: 'Second Floor Plan' },
    { no: 7, title: 'Elevation 1 - Material Structure' },
    { no: 8, title: 'Elevation 2 - Material Structure' },
    { no: 9, title: 'Elevation 3 - Material Structure' },
    { no: 10, title: 'Elevation 4 - Material Structure' },
    { no: 11, title: 'Window Details Existing' },
    { no: 12, title: 'Door Heights Existing' },
    { no: 13, title: 'Interior Finishes' },
    { no: 14, title: 'HVAC' },
];

const structureDrawingItems = [
    { no: 1, title: 'Ground Floor Slab' },
    { no: 2, title: 'First Floor Plan' },
    { no: 3, title: 'Second floor Plan' },
    { no: 4, title: 'Wall Elevation & Slab Sec' },
    { no: 5, title: 'Wall Sections & Details' },
    { no: 6, title: 'Staircase' },
    { no: 7, title: 'Column Sizes / Locations' },
    { no: 8, title: 'Beams sizes / Locations' },
];

const plumbingDrawingItems = [
    { no: 1, title: 'Sewage System' },
    { no: 2, title: 'Water Supply & Gas Systems' },
    { no: 3, title: 'Location of underground water tank' },
    { no: 4, title: 'Location of underground septic tank' },
    { no: 5, title: 'Main Water Supply Source' },
];

const electrificationDrawingItems = [
    { no: 1, title: 'Illumination Layout Plan' },
    { no: 2, title: 'Power Layout Plan' },
    { no: 3, title: 'Legend & General Notes' },
    { no: 4, title: 'Camera Dvr' },
    { no: 5, title: 'Smoke Detector / fire fighting' },
    { no: 6, title: 'PTCL Junction Box' },
    { no: 7, title: 'Main DB Location' },
    { no: 8, title: 'Sub DBs Location' },
];

export default function ProjectDataPage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const form = document.getElementById('site-survey-form') as HTMLFormElement;
        const formData = new FormData(form);
        const data: { category: string, items: string[] }[] = [];
        let currentCategory = '';

        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string' && value.trim() !== '') {
                const labelElement = form.querySelector(`label[for="${key}"]`) || form.querySelector(`label[data-label-for="${key}"]`);
                let label = key;
                if (labelElement) {
                   label = labelElement.textContent || key;
                } else {
                   const nearestTitle = (form.querySelector(`[name="${key}"]`) as HTMLElement)?.closest('fieldset')?.querySelector('legend')?.textContent;
                   label = nearestTitle ? `${nearestTitle} - ${key}` : key;
                }
                
                const sectionTitle = (form.querySelector(`[name="${key}"]`) as HTMLElement)?.closest('section')?.querySelector('h2')?.textContent || 'General';

                if(sectionTitle !== currentCategory) {
                    currentCategory = sectionTitle;
                    data.push({ category: currentCategory, items: [] });
                }
                data[data.length - 1].items.push(`${label}: ${value}`);
            }
        }
        
        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Site Survey',
                projectName: (formData.get('location_purpose') as string) || 'Untitled Survey',
                data: data,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The site survey has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };

    const handleDownloadPdf = () => {
        const form = document.getElementById('site-survey-form') as HTMLFormElement;
        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;

        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';
        const getRadioValue = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || 'N/A';
        const getCheckboxValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.checked;

        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, 14, yPos);
            yPos += 8;
        };

        const addKeyValuePair = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.text(label + ':', 14, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 60, yPos);
            yPos += 7;
        };
        
        const addCheckboxInfo = (label: string, checkboxes: {id: string, label: string}[]) => {
            const checkedItems = checkboxes.filter(cb => getCheckboxValue(cb.id)).map(cb => cb.label).join(', ');
            addKeyValuePair(label, checkedItems || 'None');
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('IHA PROJECT MANAGEMENT - Premises Review', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

        // Location
        addSectionTitle('Location');
        let purpose = [];
        if (getCheckboxValue('purpose_house')) purpose.push('House');
        if (getCheckboxValue('purpose_other_check')) purpose.push(`Other: ${getInputValue('purpose_other_text')}`);
        addKeyValuePair('Purpose', purpose.join(', '));
        addKeyValuePair('Date', getInputValue('location_date'));
        addKeyValuePair('City', getInputValue('location_city'));
        addKeyValuePair('Region', getInputValue('location_region'));
        addKeyValuePair('Address', getInputValue('location_address'));
        yPos += 5;

        // Legal File
        addSectionTitle('Legal File');
        addKeyValuePair('Name of Owner', getInputValue('legal_owner_name'));
        addKeyValuePair('Completion Certificate available', getRadioValue('completion_cert'));
        addKeyValuePair('Property Leased', getRadioValue('is_leased'));
        yPos += 5;
        
        // Area
        addSectionTitle('Area');
        addKeyValuePair('Dimension - Max Frontage', getInputValue('area_frontage'));
        addKeyValuePair('Dimension - Max Depth', getInputValue('area_depth'));
        addKeyValuePair('Total Area in Sqft', getInputValue('area_total'));
        addKeyValuePair('Min Clear Height (ft)', getInputValue('area_height'));
        addKeyValuePair('Building Plot Size', getInputValue('area_plot_size'));
        addKeyValuePair('Covered Area', getInputValue('area_covered'));
        addKeyValuePair('No. of Stories', getInputValue('area_stories'));
        yPos += 5;


        // Bounded As
        addSectionTitle('Bounded As');
        addKeyValuePair('Front', getInputValue('bounded_front'));
        addKeyValuePair('Back', getInputValue('bounded_back'));
        addKeyValuePair('Right', getInputValue('bounded_right'));
        addKeyValuePair('Left', getInputValue('bounded_left'));
        yPos += 5;
        
        // ... Continue for all other sections
         // Utilities
        addSectionTitle('Utilities');
        addKeyValuePair('Sanctioned electrical load', getInputValue('sanctioned_load_text') + (getCheckboxValue('sanctioned_load_na') ? ' (N/A)' : ''));
        addKeyValuePair('Type of electrical load', getRadioValue('electrical_load_type'));
        addKeyValuePair('Electrical Meter', getInputValue('electrical_meter'));
        addKeyValuePair('Piped water available', getRadioValue('piped_water'));
        addKeyValuePair('Underground tank', getRadioValue('underground_tank'));
        addKeyValuePair('Overhead tank', getRadioValue('overhead_tank'));
        addKeyValuePair('Type of Overhead tank', getInputValue('overhead_tank_type'));
        addKeyValuePair('Type of water', getInputValue('water_type'));
        addKeyValuePair('Gas Connection', getRadioValue('gas_connection'));
        addKeyValuePair('Connected to Sewerage line', getRadioValue('sewerage_connection'));
        yPos += 5;
        
        // Building Overview
        doc.addPage();
        yPos = 20;
        addSectionTitle('Building Overview');
        addKeyValuePair('Independent premises', getRadioValue('independent_premises'));
        addKeyValuePair('Status', getRadioValue('property_status') + (getRadioValue('property_status') === 'other' ? `: ${getInputValue('status_other_text')}` : ''));
        addKeyValuePair('Type of Premises', getRadioValue('premises_type') + (getRadioValue('premises_type') === 'other' ? `: ${getInputValue('prem_other_text')}` : ''));
        addKeyValuePair('Age of Premises', getRadioValue('building_age'));
        addKeyValuePair('Interior of Premises', getRadioValue('interior_type'));
        addKeyValuePair('Type of construction', getRadioValue('construction_type'));
        yPos += 5;

        // Building Details
        addSectionTitle('Building Details');
        addKeyValuePair('Seepage', getRadioValue('seepage'));
        addKeyValuePair('Area of seepage', getInputValue('seepage_area'));
        addKeyValuePair('Cause of Seepage', getInputValue('seepage_cause'));
        addCheckboxInfo('Property Utilization', [{id: 'util_residential', label: 'Residential'}, {id: 'util_commercial', label: 'Commercial'}, {id: 'util_dual', label: 'Dual'}, {id: 'util_industrial', label: 'Industrial'}]);
        addKeyValuePair('Condition of roof waterproofing', getInputValue('roof_waterproofing'));
        addCheckboxInfo('Parking available', [{id: 'parking_yes', label: 'Yes'}, {id: 'parking_main_road', label: 'On Main Road'}, {id: 'parking_no', label: 'No'}]);
        addKeyValuePair('Approachable through Road', getRadioValue('approachable'));
        addKeyValuePair('Wall masonary material', getInputValue('wall_material'));
        addCheckboxInfo('Major retainable building elements', [{id: 'retainable_water_tank', label: 'Water Tank'}, {id: 'retainable_subflooring', label: 'Subflooring'}, {id: 'retainable_staircase', label: 'Staircase'}, {id: 'retainable_other_check', label: `Other: ${getInputValue('retainable_other_text')}`}]);
        addKeyValuePair('Plot level from road', getInputValue('plot_level'));
        addKeyValuePair('Building Control Violations', getRadioValue('violations') + (getCheckboxValue('violation_informed') ? ' (As informed by Owner)' : ''));
        yPos += 5;

        // Rental Detail
        addSectionTitle('Rental Detail');
        addKeyValuePair('Acquisition', getInputValue('rental_acquisition'));
        addKeyValuePair('Expected Rental /month', getInputValue('rental_expected_rent'));
        addKeyValuePair('Expected Advance (# months)', getInputValue('rental_expected_advance'));
        addKeyValuePair('Expected period of lease', getInputValue('rental_lease_period'));
        addKeyValuePair('Annual increase in rental', getInputValue('rental_annual_increase'));
        yPos += 5;
        
        // Survey Checklist
        doc.addPage();
        yPos = 20;
        addSectionTitle('Survey Checklist');
        addKeyValuePair('Project', getInputValue('survey_project'));
        addKeyValuePair('Location', getInputValue('survey_location'));
        addKeyValuePair('Contract Date', getInputValue('survey_contract_date'));
        addKeyValuePair('Project Number', getInputValue('survey_project_number'));
        addKeyValuePair('Start Date', getInputValue('survey_start_date'));
        addKeyValuePair('Project Incharge', getInputValue('survey_project_incharge'));
        
        const createTable = (title: string, items: {no: number; title: string}[], prefix: string) => {
             if (yPos > 240) { doc.addPage(); yPos = 20; }
             doc.setFontSize(11);
             doc.setFont('helvetica', 'bold');
             doc.text(title, 14, yPos);
             yPos += 7;
             doc.autoTable({
                 startY: yPos,
                 head: [['Sr.No', 'Drawing Title', 'Remarks']],
                 body: items.map(item => [item.no, item.title, getInputValue(`${prefix}_remarks_${item.no}`)]),
                 theme: 'grid',
                 headStyles: { fillColor: [45, 95, 51] }
             });
             yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        createTable("Architectural Drawings", checklistItems, 'checklist');
        createTable("Structure Drawings", structureDrawingItems, 'structure');
        createTable("Plumbing Drawings", plumbingDrawingItems, 'plumbing');
        createTable("Electrification Drawings", electrificationDrawingItems, 'electrification');

        doc.save('site-survey.pdf');
        toast({ title: 'Download Started', description: 'Your site survey PDF is being generated.' });
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="text-center">
                    <p className="text-sm font-bold text-muted-foreground">ISBAH HASSAN & ASSOCIATES</p>
                    <CardTitle className="text-3xl font-headline text-primary">IHA PROJECT MANAGEMENT</CardTitle>
                    <p className="font-semibold mt-2">Premises Review</p>
                    <p className="text-sm text-muted-foreground">For Residential Project</p>
                    <p className="text-xs mt-2 max-w-2xl mx-auto">This questionnaire form provides preliminary information for determining the suitability of premises or property to be acquired</p>
                </div>
            </CardHeader>
            <CardContent>
                <form id="site-survey-form" className="space-y-8">
                     <SectionTable title="Location">
                        <FormRow label="Purpose">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2"><Checkbox id="purpose_house" name="location_purpose" value="house" /> <Label htmlFor="purpose_house">House</Label></div>
                              <div className="flex items-center gap-2"><Checkbox id="purpose_other_check" name="location_purpose_other" /> <Label htmlFor="purpose_other_check">Other:</Label> <Input id="purpose_other_text" name="location_purpose_other_text" /></div>
                           </div>
                        </FormRow>
                        <FormRow label="Date"><Input type="date" id="location_date" name="location_date" className="w-fit" /></FormRow>
                        <FormRow label="City"><Input id="location_city" name="location_city" /></FormRow>
                        <FormRow label="Region"><Input id="location_region" name="location_region" /></FormRow>
                        <FormRow label="Address"><Input id="location_address" name="location_address" /></FormRow>
                    </SectionTable>

                    <SectionTable title="Legal File">
                        <FormRow label="Name of Owner"><Input id="legal_owner_name" name="legal_owner_name" /></FormRow>
                        <FormRow label="Is Completion Certificate available">
                            <RadioGroup name="completion_cert" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cc_yes" /><Label htmlFor="cc_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cc_no" /><Label htmlFor="cc_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Is the property leased">
                            <RadioGroup name="is_leased" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="leased_yes" /><Label htmlFor="leased_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="leased_no" /><Label htmlFor="leased_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Area">
                         <FormRow label="Dimension">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Input placeholder="Maximum frontage:" id="area_frontage" name="area_frontage" />
                               <Input placeholder="Maximum Depth:" id="area_depth" name="area_depth" />
                            </div>
                         </FormRow>
                         <FormRow label="Total Area in Sqft"><Input placeholder="Total Area in Sqft" id="area_total" name="area_total" /></FormRow>
                         <FormRow label="Minimum clear height (Floor to Roof) in ft"><Input placeholder="Minimum clear height (Floor to Roof) in ft" id="area_height" name="area_height" /></FormRow>
                         <FormRow label="Building plot size of which premises is a part"><Input placeholder="Building plot size of which premises is a part" id="area_plot_size" name="area_plot_size" /></FormRow>
                         <FormRow label="Covered Area"><Input placeholder="Covered Area" id="area_covered" name="area_covered" /></FormRow>
                         <FormRow label="No. of Stories / floors"><Input placeholder="(mention mezzanine, basement, roof parapet wall etc.) If any." id="area_stories" name="area_stories" /></FormRow>
                    </SectionTable>

                    <SectionTable title="Bounded As">
                        <FormRow label="Front"><Input id="bounded_front" name="bounded_front"/></FormRow>
                        <FormRow label="Back"><Input id="bounded_back" name="bounded_back"/></FormRow>
                        <FormRow label="Right"><Input id="bounded_right" name="bounded_right" /></FormRow>
                        <FormRow label="Left"><Input id="bounded_left" name="bounded_left" /></FormRow>
                    </SectionTable>
                    
                    <SectionTable title="Utilities">
                        <FormRow label="Sanctioned electrical load">
                            <div className="flex items-center justify-between">
                                <Input id="sanctioned_load_text" name="sanctioned_load_text" />
                                <div className="flex items-center space-x-2"><Checkbox id="sanctioned_load_na" name="sanctioned_load_na" /><Label htmlFor="sanctioned_load_na">N/A</Label></div>
                            </div>
                        </FormRow>
                        <FormRow label="Type of electrical load">
                             <RadioGroup name="electrical_load_type" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="elec_commercial" /><Label htmlFor="elec_commercial">Commercial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="elec_industrial" /><Label htmlFor="elec_industrial">Industrial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="elec_residential" /><Label htmlFor="elec_residential">Residential</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Electrical Meter (single phase / 3 phase)"><Input id="electrical_meter" name="electrical_meter" /></FormRow>
                        <FormRow label="Piped water available">
                            <RadioGroup name="piped_water" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="water_yes" /><Label htmlFor="water_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="water_no" /><Label htmlFor="water_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Underground tank">
                            <RadioGroup name="underground_tank" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ug_tank_yes" /><Label htmlFor="ug_tank_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ug_tank_no" /><Label htmlFor="ug_tank_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Overhead tank">
                            <RadioGroup name="overhead_tank" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="oh_tank_yes" /><Label htmlFor="oh_tank_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="oh_tank_no" /><Label htmlFor="oh_tank_no">No</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Type of Overhead tank (RCC, Fiber etc.)"><Input id="overhead_tank_type" name="overhead_tank_type"/></FormRow>
                        <FormRow label="Type of water (boring or Line water)"><Input id="water_type" name="water_type" /></FormRow>
                        <FormRow label="Gas Connection">
                            <RadioGroup name="gas_connection" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="gas_yes" /><Label htmlFor="gas_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="gas_no" /><Label htmlFor="gas_no">No</Label></div></RadioGroup>
                        </FormRow>
                         <FormRow label="Connected to Sewerage line">
                            <RadioGroup name="sewerage_connection" className="flex items-center space-x-8"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="sewer_yes" /><Label htmlFor="sewer_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="sewer_no" /><Label htmlFor="sewer_no">No</Label></div></RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Building overview">
                         <FormRow label="Independent premises">
                             <RadioGroup name="independent_premises" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ind_yes" /><Label htmlFor="ind_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ind_no" /><Label htmlFor="ind_no">No. a part of building</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Status">
                             <RadioGroup name="property_status" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="status_comm" /><Label htmlFor="status_comm">Commercial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="status_res" /><Label htmlFor="status_res">Residential</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="status_ind" /><Label htmlFor="status_ind">Industrial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="status_other" /><Label htmlFor="status_other">Other:</Label> <Input name="status_other_text" className="h-7" /></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Type of Premises">
                             <RadioGroup name="premises_type" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residence" id="prem_res" /><Label htmlFor="prem_res">Residence</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="offices" id="prem_off" /><Label htmlFor="prem_off">Offices</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="godowns" id="prem_god" /><Label htmlFor="prem_god">Godowns</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="prem_other" /><Label htmlFor="prem_other">Other:</Label> <Input name="prem_other_text" className="h-7" /></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Age of Premises if any">
                            <RadioGroup name="building_age" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="0-5" id="age_0_5" /><Label htmlFor="age_0_5">0-5</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="5-10" id="age_5_10" /><Label htmlFor="age_5_10">5-10</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value=">10" id="age_gt_10" /><Label htmlFor="age_gt_10">More than 10 years</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Interior of Premises if any">
                            <RadioGroup name="interior_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="single_hall" id="it_single_hall" /><Label htmlFor="it_single_hall">Single Hall</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="rooms" id="it_rooms" /><Label htmlFor="it_rooms">Rooms</Label></div></RadioGroup>
                        </FormRow>
                        <FormRow label="Type of construction">
                            <RadioGroup name="construction_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="rcc" id="ct_rcc" /><Label htmlFor="ct_rcc">Beam-Column in RCC</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="composite" id="ct_composite" /><Label htmlFor="ct_composite">Composit Structure</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="load_bearing" id="ct_load_bearing" /><Label htmlFor="ct_load_bearing">Load Bearing in walls</Label></div></RadioGroup>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Building Details">
                        <FormRow label="Seepage">
                             <RadioGroup name="seepage" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="seepage_yes" /><Label htmlFor="seepage_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="seepage_no" /><Label htmlFor="seepage_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Area of seepage (Walls, slab etc.)"><Input id="seepage_area" name="seepage_area"/></FormRow>
                        <FormRow label="Cause of Seepage"><Input id="seepage_cause" name="seepage_cause" /></FormRow>
                        <FormRow label="Property Utilization">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="util_residential" name="util_residential" /><Label htmlFor="util_residential">Fully residential</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_commercial" name="util_commercial"/><Label htmlFor="util_commercial">Fully Commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_dual" name="util_dual" /><Label htmlFor="util_dual">Dual use residential & commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_industrial" name="util_industrial" /><Label htmlFor="util_industrial">Industrial</Label></div>
                            </div>
                        </FormRow>
                         <FormRow label="Condition of roof waterproofing (if applicable)"><Input id="roof_waterproofing" name="roof_waterproofing" /></FormRow>
                        <FormRow label="Parking available">
                             <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="parking_yes" name="parking_yes" /><Label htmlFor="parking_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_main_road" name="parking_main_road" /><Label htmlFor="parking_main_road">On Main Road</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_no" name="parking_no" /><Label htmlFor="parking_no">No</Label></div>
                            </div>
                        </FormRow>
                        <FormRow label="Approachable through Road">
                             <RadioGroup name="approachable" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="approachable_yes" /><Label htmlFor="approachable_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="approachable_no" /><Label htmlFor="approachable_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                         <FormRow label="Wall masonary material as per region"><Input id="wall_material" name="wall_material" /></FormRow>
                        <FormRow label="Major retainable building elements">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_water_tank" name="retainable_water_tank" /><Label htmlFor="retainable_water_tank">Water tank</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_subflooring" name="retainable_subflooring" /><Label htmlFor="retainable_subflooring">Subflooring</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_staircase" name="retainable_staircase" /><Label htmlFor="retainable_staircase">staircase</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_other_check" name="retainable_other_check" /><Label htmlFor="retainable_other_check">Others</Label><Input id="retainable_other_text" name="retainable_other_text" className="h-7" /></div>
                            </div>
                        </FormRow>
                        <FormRow label="Incase of Plot provide existing level from road & surrounding buildings"><Input id="plot_level" name="plot_level" /></FormRow>
                        <FormRow label="Building Control Violations">
                             <div className="flex flex-wrap items-center gap-4">
                                 <RadioGroup name="violations" className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="major" id="violation_major" /><Label htmlFor="violation_major">Major</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="minor" id="violation_minor" /><Label htmlFor="violation_minor">Minor</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="violation_none" /><Label htmlFor="violation_none">No Deviation</Label></div>
                                </RadioGroup>
                                 <div className="flex items-center space-x-2"><Checkbox id="violation_informed" name="violation_informed" /><Label htmlFor="violation_informed">As Informed by Owner Representative</Label></div>
                            </div>
                        </FormRow>
                    </SectionTable>

                    <SectionTable title="Rental Detail">
                        <FormRow label="Acquisition"><Input id="rental_acquisition" name="rental_acquisition" /></FormRow>
                        <FormRow label="Expected Rental /month"><Input id="rental_expected_rent" name="rental_expected_rent" /></FormRow>
                        <FormRow label="Expected Advance (# of months)"><Input id="rental_expected_advance" name="rental_expected_advance"/></FormRow>
                        <FormRow label="Expected period of lease"><Input id="rental_lease_period" name="rental_lease_period"/></FormRow>
                        <FormRow label="Annual increase in rental"><Input id="rental_annual_increase" name="rental_annual_increase"/></FormRow>
                    </SectionTable>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-primary mb-3 pb-2 border-b-2 border-primary">Survey Checklist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 p-4 border rounded-lg">
                           <Input id="survey_project" name="survey_project" placeholder="Project" />
                           <Input id="survey_location" name="survey_location" placeholder="Location" />
                           <Input id="survey_contract_date" name="survey_contract_date" type="date" placeholder="Contract Date" />
                           <Input id="survey_project_number" name="survey_project_number" placeholder="Project Number" />
                           <Input id="survey_start_date" name="survey_start_date" type="date" placeholder="Start Date" />
                           <Input id="survey_project_incharge" name="survey_project_incharge" placeholder="Project Incharge" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Architectural Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {checklistItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`checklist_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Structure Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {structureDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`structure_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Plumbing Drawings</h3>
                         <Table>
                            <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {plumbingDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`plumbing_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                         <h3 className="text-lg font-semibold text-primary mt-6 mb-2">Electrification Drawings</h3>
                         <Table>
                             <TableHeader><TableRow><TableHead className="w-16">Sr.No</TableHead><TableHead>Drawing Title</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {electrificationDrawingItems.map(item => (<TableRow key={item.no}><TableCell>{item.no}</TableCell><TableCell>{item.title}</TableCell><TableCell><Textarea name={`electrification_remarks_${item.no}`} rows={1} /></TableCell></TableRow>))}
                            </TableBody>
                         </Table>
                    </section>


                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

    