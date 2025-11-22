
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
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

const Section = ({ title, children, className }: { title?: string; children: React.ReactNode, className?: string }) => (
  <div className={`mb-6 ${className}`}>
    {title && <h2 className="text-xl font-bold text-primary mb-3 pb-2 border-b border-primary">{title}</h2>}
    <div className="space-y-4 text-sm">
      {children}
    </div>
  </div>
);

const FormRow = ({ label, children, htmlFor }: { label: string, children: React.ReactNode, htmlFor?: string }) => (
    <div className="grid md:grid-cols-3 items-start gap-2 md:gap-4 py-2 border-b">
        <Label htmlFor={htmlFor} className="md:text-right font-semibold pt-1">{label}</Label>
        <div className="md:col-span-2">{children}</div>
    </div>
);

const ChecklistRow = ({ no, title, id }: { no: string | number, title: string, id: string }) => (
    <TableRow>
        <TableCell className="font-medium">{no}</TableCell>
        <TableCell>{title}</TableCell>
        <TableCell>
            <Textarea name={`${id}_remarks`} id={`${id}_remarks`} rows={1} />
        </TableCell>
    </TableRow>
);


export default function SiteSurveyPage() {
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
        if (!form) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not find form data.' });
             return;
        }

        const doc = new jsPDF() as jsPDFWithAutoTable;
        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 14;
        const primaryColor = [45, 95, 51]; 

        const checkAndAddPage = () => {
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }
        };

        const getInputValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || 'N/A';
        const getRadioValue = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || 'N/A';
        const getCheckboxValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.checked ? 'Yes' : 'No';

        const addSection = (title: string, content: {label: string, value: string}[]) => {
            checkAndAddPage();
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(title, margin, yPos);
            doc.setTextColor(0,0,0);
            yPos += 8;

            content.forEach(item => {
                checkAndAddPage();
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(item.label + ':', margin, yPos);
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(item.value, doc.internal.pageSize.width - margin - 80);
                doc.text(splitText, margin + 60, yPos);
                yPos += (splitText.length * 5) + 3;
            });
            yPos += 5;
        };

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Site Survey - Premises Review", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setTextColor(0,0,0);

        addSection('Location', [
            { label: 'Region', value: getInputValue('location_region') },
            { label: 'Address', value: getInputValue('location_address') },
            { label: 'City', value: getInputValue('location_city') },
            { label: 'Purpose', value: getInputValue('location_purpose') },
        ]);

        addSection('Legal File', [
            { label: 'Date', value: getInputValue('legal_date') },
            { label: 'Name of Owner', value: getInputValue('legal_owner_name') },
            { label: 'Is property leased?', value: getRadioValue('is_leased') },
        ]);

        addSection('Area', [
            { label: 'Total Area in Sqft', value: getInputValue('area_total') },
            { label: 'Max Frontage', value: getInputValue('area_max_frontage') },
            { label: 'Max Depth', value: getInputValue('area_max_depth') },
            { label: 'Plot Size', value: getInputValue('area_plot_size') },
            { label: 'Covered Area', value: getInputValue('area_covered') },
            { label: 'Attach as-built plan(s)', value: getCheckboxValue('area_attach_plan') },
        ]);

        addSection('Building Overview', [
            { label: 'No. of Stories/Floors', value: getInputValue('building_stories') },
            { label: 'Min Clear Height (ft)', value: getInputValue('building_clear_height') },
            { label: 'Age of Premises', value: getRadioValue('building_age') },
            { label: 'Type of Premises', value: getRadioValue('premises_type') },
            { label: 'Interior of Premises', value: getRadioValue('interior_type') },
            { label: 'Completion Certificate', value: getRadioValue('completion_cert') },
            { label: 'Type of Construction', value: getRadioValue('construction_type') },
            { label: 'Staircase', value: getRadioValue('staircase') },
            { label: 'Roof Waterproofing', value: getRadioValue('roof_waterproofing') },
            { label: 'Seepage', value: getRadioValue('seepage') },
            { label: 'Area of Seepage', value: getInputValue('seepage_area') },
            { label: 'Cause of Seepage', value: getInputValue('seepage_cause') },
            { label: 'Retainable Elements', value: getInputValue('retainable_elements') },
            { label: 'Plot Level from Road', value: getInputValue('plot_level') },
            { label: 'Water Tank', value: getInputValue('water_tank') },
        ]);

        addSection('Property Utilization', [
            { label: 'Status', value: getRadioValue('property_status') },
            { label: 'Parking Available', value: getRadioValue('parking') },
            { label: 'Approachable via', value: getRadioValue('road_access') },
            { label: 'Building Violations', value: getRadioValue('violations') },
            { label: 'Wall Masonry Material', value: getInputValue('wall_material') },
        ]);

        addSection('Utilities', [
            { label: 'Piped Water', value: getRadioValue('piped_water') },
            { label: 'Sewerage Connection', value: getRadioValue('sewerage') },
            { label: 'Gas Connection', value: getRadioValue('gas') },
            { label: 'Electrical Meter', value: getRadioValue('elec_meter') },
            { label: 'Type of Electrical Load', value: getRadioValue('elec_load_type') },
            { label: 'Sanctioned Load', value: getInputValue('elec_load_sanctioned') },
            { label: 'Overhead Tank', value: getRadioValue('overhead_tank') },
            { label: 'Type of Overhead Tank', value: getInputValue('overhead_tank_type') },
            { label: 'Underground Tank', value: getRadioValue('underground_tank') },
            { label: 'Type of Water', value: getInputValue('water_type') },
        ]);
        
        addSection('Bounded As', [
            { label: 'Front', value: getInputValue('bounded_front') },
            { label: 'Back', value: getInputValue('bounded_back') },
            { label: 'Left', value: getInputValue('bounded_left') },
            { label: 'Right', value: getInputValue('bounded_right') },
        ]);

        addSection('Rental Detail', [
            { label: 'Acquisition', value: getRadioValue('rental_acquisition') },
            { label: 'Expected Rental/month', value: getInputValue('rental_expected') },
            { label: 'Annual Increase', value: getInputValue('rental_increase') },
            { label: 'Lease Period', value: getInputValue('rental_lease_period') },
            { label: 'Expected Advance', value: getInputValue('rental_advance') },
        ]);
        
        checkAndAddPage();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Survey Checklist', margin, yPos);
        doc.setTextColor(0,0,0);
        yPos += 8;

        const tableData = [
          { no: 1, title: "Existing Plan", id: "existing_plan" },
          { no: 2, title: "Site Plan", id: "site_plan" },
          { no: 3, title: "Basement Plan", id: "basement_plan" },
          { no: 4, title: "Ground Floor Plan", id: "ground_floor_plan" },
          { no: 5, title: "First Floor Plan", id: "first_floor_plan" },
          { no: 6, title: "Second Floor Plan", id: "second_floor_plan" },
          { no: 7, title: "Elevation 1- Material Structure", id: "elevation_1" },
          { no: 8, title: "Elevation 2- Material Structure", id: "elevation_2" },
          { no: 9, title: "Elevation 3- Material Structure", id: "elevation_3" },
          { no: 10, title: "Elevation 4- Material Structure", id: "elevation_4" },
          { no: 11, title: "Window Details Existing", id: "window_details" },
          { no: 12, title: "Door Heights Existing", id: "door_heights" },
          { no: 13, title: "Interior Finishes", id: "interior_finishes" },
          { no: 14, title: "HVAC", id: "hvac" },
        ];
        
        const remarksBody = tableData.map(row => [row.no, row.title, getInputValue(`${row.id}_remarks`)]);

        doc.autoTable({
            head: [['Sr.No', 'Drawing Title', 'Remarks']],
            body: remarksBody,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: [255,255,255] }
        });


        doc.save("site-survey-data.pdf");
        toast({ title: 'Download Started', description: 'Your site survey data is being downloaded as a PDF.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl text-center font-headline text-primary">Site Survey - Premises Review</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="site-survey-form" className="space-y-8">
                    <Section title="Location">
                        <FormRow label="Region" htmlFor="location_region">
                            <Input id="location_region" name="location_region" />
                        </FormRow>
                        <FormRow label="Address" htmlFor="location_address">
                            <Input id="location_address" name="location_address" />
                        </FormRow>
                        <FormRow label="City" htmlFor="location_city">
                            <Input id="location_city" name="location_city" />
                        </FormRow>
                        <FormRow label="Purpose" htmlFor="location_purpose">
                            <Input id="location_purpose" name="location_purpose" placeholder="House, Office, etc." />
                        </FormRow>
                    </Section>

                    <Section title="Legal File">
                        <FormRow label="Date" htmlFor="legal_date">
                            <Input type="date" id="legal_date" name="legal_date" />
                        </FormRow>
                        <FormRow label="Name of Owner" htmlFor="legal_owner_name">
                             <Input id="legal_owner_name" name="legal_owner_name" />
                        </FormRow>
                        <FormRow label="Is property leased?">
                             <RadioGroup name="is_leased" className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="is_leased_yes" /><Label htmlFor="is_leased_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="is_leased_no" /><Label htmlFor="is_leased_no">No</Label></div>
                             </RadioGroup>
                        </FormRow>
                    </Section>

                    <Section title="Area">
                        <FormRow label="Total Area in Sqft" htmlFor="area_total">
                            <Input id="area_total" name="area_total" />
                        </FormRow>
                        <FormRow label="Dimension">
                            <div className="grid grid-cols-2 gap-4">
                                <Input name="area_max_frontage" placeholder="Maximum frontage" />
                                <Input name="area_max_depth" placeholder="Maximum Depth" />
                            </div>
                        </FormRow>
                         <FormRow label="Building plot size of which premises is a part" htmlFor="area_plot_size">
                            <Input id="area_plot_size" name="area_plot_size" />
                        </FormRow>
                         <FormRow label="Covered Area" htmlFor="area_covered">
                            <Input id="area_covered" name="area_covered" />
                        </FormRow>
                         <FormRow label="Attach as-built plan(s)">
                            <Checkbox id="area_attach_plan" name="area_attach_plan" />
                        </FormRow>
                    </Section>
                    
                    <Section title="Building Overview">
                        <FormRow label="No. of Stories/Floors"><Input name="building_stories" placeholder="mention mezzanine, basement, etc." /></FormRow>
                        <FormRow label="Minimum clear height (Floor to Roof) in ft"><Input name="building_clear_height" /></FormRow>
                        <FormRow label="Age of Premises"><RadioGroup name="building_age" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="0-5" id="age_0_5" /><Label htmlFor="age_0_5">0-5</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="5-10" id="age_5_10" /><Label htmlFor="age_5_10">5-10</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value=">10" id="age_gt_10" /><Label htmlFor="age_gt_10"> &gt; 10 years</Label></div></RadioGroup></FormRow>
                        <FormRow label="Type of Premises"><RadioGroup name="premises_type" className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="independent" id="pt_independent" /><Label htmlFor="pt_independent">Independent</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="part" id="pt_part" /><Label htmlFor="pt_part">A part of building</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="godowns" id="pt_godowns" /><Label htmlFor="pt_godowns">Godowns</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="pt_other" /><Label htmlFor="pt_other">Other</Label></div></RadioGroup></FormRow>
                        <FormRow label="Interior of Premises"><RadioGroup name="interior_type" className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="single_hall" id="it_single_hall" /><Label htmlFor="it_single_hall">Single Hall</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="residence" id="it_residence" /><Label htmlFor="it_residence">Residence</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="offices" id="it_offices" /><Label htmlFor="it_offices">Offices</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="it_other" /><Label htmlFor="it_other">Other</Label></div></RadioGroup></FormRow>
                        <FormRow label="Is Completion Certificate available?"><RadioGroup name="completion_cert" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cc_yes" /><Label htmlFor="cc_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cc_no" /><Label htmlFor="cc_no">No</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="as_informed" id="cc_as_informed" /><Label htmlFor="cc_as_informed">As informed by Owner/Rep</Label></div></RadioGroup></FormRow>
                        <FormRow label="Type of construction"><RadioGroup name="construction_type" className="grid grid-cols-2 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="rcc" id="ct_rcc" /><Label htmlFor="ct_rcc">Beam-Column in RCC</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="composite" id="ct_composite" /><Label htmlFor="ct_composite">Composite Structure</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="load_bearing" id="ct_load_bearing" /><Label htmlFor="ct_load_bearing">Load Bearing in walls</Label></div></RadioGroup></FormRow>
                    </Section>
                    
                     <Section>
                        <FormRow label="Staircase"><RadioGroup name="staircase" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="stair_yes" /><Label htmlFor="stair_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="stair_no" /><Label htmlFor="stair_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Condition of roof waterproofing"><RadioGroup name="roof_waterproofing" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="rw_yes" /><Label htmlFor="rw_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="rw_no" /><Label htmlFor="rw_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Seepage"><RadioGroup name="seepage" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="seepage_yes" /><Label htmlFor="seepage_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="seepage_no" /><Label htmlFor="seepage_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Area of seepage"><Input name="seepage_area" placeholder="Walls, slab etc." /></FormRow>
                        <FormRow label="Cause of Seepage"><Input name="seepage_cause" /></FormRow>
                        <FormRow label="Major retainable building elements"><Input name="retainable_elements" placeholder="Subflooring" /></FormRow>
                        <FormRow label="Incase of Plot provide existing level from road & surrounding buildings"><Input name="plot_level" /></FormRow>
                        <FormRow label="Water tank"><Input name="water_tank" /></FormRow>
                    </Section>
                    
                    <Section title="Property Utilization">
                        <FormRow label="Status"><RadioGroup name="property_status" className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="fully_res" id="ps_fully_res" /><Label htmlFor="ps_fully_res">Fully residential</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="fully_comm" id="ps_fully_comm" /><Label htmlFor="ps_fully_comm">Fully Commercial</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="dual_use" id="ps_dual_use" /><Label htmlFor="ps_dual_use">Dual use</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="ps_industrial" /><Label htmlFor="ps_industrial">Industrial</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="ps_other" /><Label htmlFor="ps_other">Others</Label></div></RadioGroup></FormRow>
                        <FormRow label="Parking available"><RadioGroup name="parking" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="park_yes" /><Label htmlFor="park_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="park_no" /><Label htmlFor="park_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Approachable through Road"><RadioGroup name="road_access" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="main_road" id="ra_main" /><Label htmlFor="ra_main">On Main Road</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="ra_other" /><Label htmlFor="ra_other">Other</Label></div></RadioGroup></FormRow>
                        <FormRow label="Building Control Violations"><RadioGroup name="violations" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="major" id="v_major" /><Label htmlFor="v_major">Major</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="minor" id="v_minor" /><Label htmlFor="v_minor">Minor</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="none" id="v_none" /><Label htmlFor="v_none">No Deviation</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="as_informed" id="v_as_informed" /><Label htmlFor="v_as_informed">As Informed by Owner/Rep</Label></div></RadioGroup></FormRow>
                        <FormRow label="Wall masonary material as per region"><Input name="wall_material" /></FormRow>
                    </Section>

                    <Section title="Utilities">
                        <FormRow label="Piped water available"><RadioGroup name="piped_water" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="pw_yes" /><Label htmlFor="pw_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="pw_no" /><Label htmlFor="pw_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Connected to Sewerage line"><RadioGroup name="sewerage" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="sw_yes" /><Label htmlFor="sw_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="sw_no" /><Label htmlFor="sw_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Gas Connection"><RadioGroup name="gas" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="gas_yes" /><Label htmlFor="gas_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="gas_no" /><Label htmlFor="gas_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Electrical Meter"><RadioGroup name="elec_meter" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="em_yes" /><Label htmlFor="em_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="em_no" /><Label htmlFor="em_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Type of electrical load"><RadioGroup name="elec_load_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="single" id="elt_single" /><Label htmlFor="elt_single">Single Phase</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="3phase" id="elt_3phase" /><Label htmlFor="elt_3phase">3 Phase</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="elt_comm" /><Label htmlFor="elt_comm">Commercial</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="elt_ind" /><Label htmlFor="elt_ind">Industrial</Label></div></RadioGroup></FormRow>
                        <FormRow label="Sanctioned electrical load"><Input name="elec_load_sanctioned" /></FormRow>
                        <FormRow label="Overhead tank"><RadioGroup name="overhead_tank" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="oht_yes" /><Label htmlFor="oht_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="oht_no" /><Label htmlFor="oht_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Type of Overhead tank"><Input name="overhead_tank_type" placeholder="RCC, Fiber etc." /></FormRow>
                        <FormRow label="Underground tank"><RadioGroup name="underground_tank" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ugt_yes" /><Label htmlFor="ugt_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ugt_no" /><Label htmlFor="ugt_no">No</Label></div></RadioGroup></FormRow>
                        <FormRow label="Type of water"><Input name="water_type" placeholder="boring or Line water" /></FormRow>
                    </Section>

                     <Section title="Bounded As">
                        <FormRow label="Front"><Input name="bounded_front" /></FormRow>
                        <FormRow label="Back"><Input name="bounded_back" /></FormRow>
                        <FormRow label="Left"><Input name="bounded_left" /></FormRow>
                        <FormRow label="Right"><Input name="bounded_right" /></FormRow>
                    </Section>

                    <Section title="Rental Detail">
                         <FormRow label="Acquisition"><RadioGroup name="rental_acquisition" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="ra_res" /><Label htmlFor="ra_res">Residential</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="ra_com" /><Label htmlFor="ra_com">Commercial</Label></div></RadioGroup></FormRow>
                        <FormRow label="Expected Rental /month"><Input name="rental_expected" /></FormRow>
                        <FormRow label="Annual increase in rental"><Input name="rental_increase" /></FormRow>
                        <FormRow label="Expected period of lease"><Input name="rental_lease_period" /></FormRow>
                        <FormRow label="Expected Advance (# of months)"><Input name="rental_advance" /></FormRow>
                    </Section>
                    
                    <Section title="Survey Checklist">
                        <div className="pb-4">
                            <h3 className="font-bold text-lg mb-2">ISBAH HASSAN & ASSOCIATES</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Input name="checklist_project" placeholder="Project" />
                                <Input name="checklist_location" placeholder="Location" />
                                <Input name="checklist_contract_date" type="date" placeholder="Contract Date" />
                                <Input name="checklist_project_number" placeholder="Project Number" />
                                <Input name="checklist_start_date" type="date" placeholder="Start Date" />
                                <Input name="checklist_project_incharge" placeholder="Project Incharge" />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Sr.No</TableHead>
                                    <TableHead>Drawing Title</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow><TableCell colSpan={3} className="font-bold bg-muted">Existing Plan</TableCell></TableRow>
                                <ChecklistRow no={1} title="Existing Plan" id="existing_plan" />
                                <ChecklistRow no={2} title="Site Plan" id="site_plan" />
                                <ChecklistRow no={3} title="Basement Plan" id="basement_plan" />
                                <ChecklistRow no={4} title="Ground Floor Plan" id="ground_floor_plan" />
                                <ChecklistRow no={5} title="First Floor Plan" id="first_floor_plan" />
                                <ChecklistRow no={6} title="Second Floor Plan" id="second_floor_plan" />
                                <ChecklistRow no={7} title="Elevation 1- Material Structure" id="elevation_1" />
                                <ChecklistRow no={8} title="Elevation 2- Material Structure" id="elevation_2" />
                                <ChecklistRow no={9} title="Elevation 3- Material Structure" id="elevation_3" />
                                <ChecklistRow no={10} title="Elevation 4- Material Structure" id="elevation_4" />
                                <ChecklistRow no={11} title="Window Details Existing" id="window_details" />
                                <ChecklistRow no={12} title="Door Heights Existing" id="door_heights" />
                                <ChecklistRow no={13} title="Interior Finishes" id="interior_finishes" />
                                <ChecklistRow no={14} title="HVAC" id="hvac" />
                                
                                <TableRow><TableCell colSpan={3} className="font-bold bg-muted">Structure Drawings</TableCell></TableRow>
                                <ChecklistRow no={1} title="Ground Floor Slab" id="struct_ground_slab" />
                                <ChecklistRow no={2} title="First Floor Plan" id="struct_first_plan" />
                                <ChecklistRow no={3} title="Second Floor Plan" id="struct_second_plan" />
                                <ChecklistRow no={4} title="Wall Elevation & Slab Sec" id="struct_wall_elev" />
                                <ChecklistRow no={5} title="Wall Sections & Details" id="struct_wall_sections" />
                                <ChecklistRow no={6} title="Staircase" id="struct_staircase" />
                                <ChecklistRow no={7} title="Column Sizes / Locations" id="struct_columns" />
                                <ChecklistRow no={8} title="Beams sizes / Locations" id="struct_beams" />

                                <TableRow><TableCell colSpan={3} className="font-bold bg-muted">Plumbing Drawings</TableCell></TableRow>
                                <ChecklistRow no={1} title="Sewage System" id="plumb_sewage" />
                                <ChecklistRow no={2} title="Water Supply & Gas Systems" id="plumb_water_gas" />
                                <ChecklistRow no={3} title="Location of underground water tank" id="plumb_ug_water_tank" />
                                <ChecklistRow no={4} title="Location of underground septic tank" id="plumb_ug_septic_tank" />
                                <ChecklistRow no={5} title="Main Water Supply Source" id="plumb_main_water" />

                                <TableRow><TableCell colSpan={3} className="font-bold bg-muted">Electrification Drawings</TableCell></TableRow>
                                <ChecklistRow no={1} title="Illumination Layout Plan" id="elec_illumination" />
                                <ChecklistRow no={2} title="Power Layout Plan" id="elec_power" />
                                <ChecklistRow no={3} title="Legend & General Notes" id="elec_legend" />
                                <ChecklistRow no={4} title="Camera Dvr" id="elec_camera" />
                                <ChecklistRow no={5} title="Smoke Detector / Fire Fighting" id="elec_smoke" />
                                <ChecklistRow no={6} title="PTCL Junction Box" id="elec_ptcl" />
                                <ChecklistRow no={7} title="Main DB Location" id="elec_main_db" />
                                <ChecklistRow no={8} title="Sub DBs Location" id="elec_sub_db" />
                            </TableBody>
                        </Table>
                    </Section>

                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

    