
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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


export default function ProjectDataPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-data');
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Record Saved",
            description: "The project data has been successfully saved.",
        });
    }

    const handleDownloadPdf = () => {
        const form = document.getElementById('project-data-form') as HTMLFormElement;
        if (!form) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find form data.' });
            return;
        }

        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 22;
        const primaryColor = [45, 95, 51]; 

        const getInputValue = (id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value || '';
        const getRadioValue = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement)?.value || '';
        
        const addSectionTitle = (title: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(title, margin, yPos);
            doc.setTextColor(0, 0, 0); // Reset to black
            yPos += 8;
        };

        const addKeyValuePair = (label: string, value: string) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitValue = doc.splitTextToSize(value, pageWidth - margin * 2 - 50);
            doc.text(splitValue, margin + 60, yPos);
            yPos += (splitValue.length * 5) + 2;
        };
        
        const addTextArea = (label: string, value: string) => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
             doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(value, pageWidth - margin * 2 - 5);
            doc.text(splitText, margin + 5, yPos);
            yPos += (splitText.length * 5) + 5;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('PROJECT DATA', pageWidth / 2, 15, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // --- General Info ---
        addSectionTitle("Location");
        addKeyValuePair('Region:', getInputValue('location_region'));
        addKeyValuePair('Address:', getInputValue('location_address'));
        addKeyValuePair('City:', getInputValue('location_city'));
        addKeyValuePair('Purpose:', getInputValue('location_purpose'));

        addSectionTitle("Legal File");
        addKeyValuePair('Date:', getInputValue('legal_date'));
        addKeyValuePair('Name of Owner:', getInputValue('legal_owner_name'));
        addKeyValuePair('Is property leased?:', getRadioValue('is_leased'));

        addSectionTitle("Area");
        addKeyValuePair('Total Area in Sqft:', getInputValue('area_total'));
        addKeyValuePair('Dimension:', `Max Frontage: ${getInputValue('area_max_frontage')}, Max Depth: ${getInputValue('area_max_depth')}`);
        addKeyValuePair('Plot Size:', getInputValue('area_plot_size'));
        addKeyValuePair('Covered Area:', getInputValue('area_covered'));
        addKeyValuePair('Attach as-built plan(s):', getInputValue('area_attach_plan'));

        addSectionTitle("Bounded As");
        addKeyValuePair('Front:', getInputValue('bounded_front'));
        addKeyValuePair('Back:', getInputValue('bounded_back'));
        addKeyValuePair('Left:', getInputValue('bounded_left'));
        addKeyValuePair('Right:', getInputValue('bounded_right'));

        addSectionTitle("Utilities");
        addKeyValuePair('Piped Water:', getRadioValue('piped_water'));
        addKeyValuePair('Sewerage Connection:', getRadioValue('sewerage'));
        addKeyValuePair('Gas Connection:', getRadioValue('gas'));
        addKeyValuePair('Electrical Meter:', getRadioValue('elec_meter'));
        addKeyValuePair('Type of Electrical Load:', getRadioValue('elec_load_type'));
        addKeyValuePair('Sanctioned Load:', getInputValue('elec_load_sanctioned'));
        addKeyValuePair('Overhead Tank:', getRadioValue('overhead_tank'));
        addKeyValuePair('Type of Overhead Tank:', getInputValue('overhead_tank_type'));
        addKeyValuePair('Underground Tank:', getRadioValue('underground_tank'));
        addKeyValuePair('Type of Water:', getInputValue('water_type'));

        addSectionTitle('Building Overview');
        addKeyValuePair('No. of Stories/Floors:', getInputValue('building_stories'));
        addKeyValuePair('Min Clear Height (ft):', getInputValue('building_clear_height'));
        addKeyValuePair('Age of Premises:', getRadioValue('building_age'));
        addKeyValuePair('Type of Premises:', getRadioValue('premises_type'));
        addKeyValuePair('Interior of Premises:', getRadioValue('interior_type'));
        addKeyValuePair('Completion Certificate:', getRadioValue('completion_cert'));
        addKeyValuePair('Type of Construction:', getRadioValue('construction_type'));
        addKeyValuePair('Staircase:', getRadioValue('staircase'));
        addKeyValuePair('Roof Waterproofing:', getRadioValue('roof_waterproofing'));
        addKeyValuePair('Seepage:', getRadioValue('seepage'));
        addKeyValuePair('Area of Seepage:', getInputValue('seepage_area'));
        addKeyValuePair('Cause of Seepage:', getInputValue('seepage_cause'));
        addKeyValuePair('Retainable Elements:', getInputValue('retainable_elements'));
        addKeyValuePair('Plot Level from Road:', getInputValue('plot_level'));
        addKeyValuePair('Water Tank:', getInputValue('water_tank'));

        addSectionTitle("Property Utilization");
        addKeyValuePair('Status:', getRadioValue('property_status'));
        addKeyValuePair('Parking Available:', getRadioValue('parking'));
        addKeyValuePair('Approachable via:', getRadioValue('road_access'));
        addKeyValuePair('Building Violations:', getRadioValue('violations'));
        addKeyValuePair('Wall Masonry Material:', getInputValue('wall_material'));

        addSectionTitle("Rental Detail");
        addKeyValuePair('Acquisition:', getRadioValue('rental_acquisition'));
        addKeyValuePair('Expected Rental/month:', getInputValue('rental_expected'));
        addKeyValuePair('Annual Increase:', getInputValue('rental_increase'));
        addKeyValuePair('Lease Period:', getInputValue('rental_lease_period'));
        addKeyValuePair('Expected Advance:', getInputValue('rental_advance'));
        
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


        doc.save('site-survey-data.pdf');
        
        toast({
            title: "Download Started",
            description: "The site survey data PDF is being generated.",
        });
    }
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Site Survey - Premises Review"
                description="A comprehensive data sheet for the project site survey."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="site-survey-form">
                        <Section title="Location">
                           <FormRow label="Region" htmlFor="location_region"><Input id="location_region" name="location_region" /></FormRow>
                           <FormRow label="Address" htmlFor="location_address"><Input id="location_address" name="location_address" /></FormRow>
                           <FormRow label="City" htmlFor="location_city"><Input id="location_city" name="location_city" /></FormRow>
                           <FormRow label="Purpose" htmlFor="location_purpose"><Input id="location_purpose" name="location_purpose" placeholder="House, Office, etc." /></FormRow>
                        </Section>

                        <Section title="Legal File">
                            <FormRow label="Date" htmlFor="legal_date"><Input type="date" id="legal_date" name="legal_date" /></FormRow>
                            <FormRow label="Name of Owner" htmlFor="legal_owner_name"><Input id="legal_owner_name" name="legal_owner_name" /></FormRow>
                            <FormRow label="Is property leased?"><RadioGroup name="is_leased" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="is_leased_yes" /><Label htmlFor="is_leased_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="is_leased_no" /><Label htmlFor="is_leased_no">No</Label></div></RadioGroup></FormRow>
                        </Section>
                        
                        <Section title="Area">
                           <FormRow label="Total Area in Sqft" htmlFor="area_total"><Input id="area_total" name="area_total" /></FormRow>
                           <FormRow label="Dimension"><div className="grid grid-cols-2 gap-4"><Input name="area_max_frontage" placeholder="Maximum frontage" /><Input name="area_max_depth" placeholder="Maximum Depth" /></div></FormRow>
                           <FormRow label="Building plot size of which premises is a part" htmlFor="area_plot_size"><Input id="area_plot_size" name="area_plot_size" /></FormRow>
                           <FormRow label="Covered Area" htmlFor="area_covered"><Input id="area_covered" name="area_covered" /></FormRow>
                           <FormRow label="Attach as-built plan(s)"><Checkbox id="area_attach_plan" name="area_attach_plan" /></FormRow>
                        </Section>

                        <Section title="Bounded As">
                            <FormRow label="Front"><Input name="bounded_front" /></FormRow>
                            <FormRow label="Back"><Input name="bounded_back" /></FormRow>
                            <FormRow label="Left"><Input name="bounded_left" /></FormRow>
                            <FormRow label="Right"><Input name="bounded_right" /></FormRow>
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

                        <Section title="Building Overview">
                            <FormRow label="No. of Stories/Floors"><Input name="building_stories" placeholder="mention mezzanine, basement, etc." /></FormRow>
                            <FormRow label="Minimum clear height (Floor to Roof) in ft"><Input name="building_clear_height" /></FormRow>
                            <FormRow label="Age of Premises"><RadioGroup name="building_age" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="0-5" id="age_0_5" /><Label htmlFor="age_0_5">0-5</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="5-10" id="age_5_10" /><Label htmlFor="age_5_10">5-10</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value=">10" id="age_gt_10" /><Label htmlFor="age_gt_10"> &gt; 10 years</Label></div></RadioGroup></FormRow>
                            <FormRow label="Type of Premises"><RadioGroup name="premises_type" className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="independent" id="pt_independent" /><Label htmlFor="pt_independent">Independent</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="part" id="pt_part" /><Label htmlFor="pt_part">A part of building</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="godowns" id="pt_godowns" /><Label htmlFor="pt_godowns">Godowns</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="pt_other" /><Label htmlFor="pt_other">Other</Label></div></RadioGroup></FormRow>
                            <FormRow label="Interior of Premises"><RadioGroup name="interior_type" className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="single_hall" id="it_single_hall" /><Label htmlFor="it_single_hall">Single Hall</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="residence" id="it_residence" /><Label htmlFor="it_residence">Residence</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="offices" id="it_offices" /><Label htmlFor="it_offices">Offices</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="other" id="it_other" /><Label htmlFor="it_other">Other</Label></div></RadioGroup></FormRow>
                            <FormRow label="Is Completion Certificate available?"><RadioGroup name="completion_cert" className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cc_yes" /><Label htmlFor="cc_yes">Yes</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cc_no" /><Label htmlFor="cc_no">No</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="as_informed" id="cc_as_informed" /><Label htmlFor="cc_as_informed">As informed by Owner/Rep</Label></div></RadioGroup></FormRow>
                            <FormRow label="Type of construction"><RadioGroup name="construction_type" className="grid grid-cols-2 gap-2"><div className="flex items-center space-x-2"><RadioGroupItem value="rcc" id="ct_rcc" /><Label htmlFor="ct_rcc">Beam-Column in RCC</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="composite" id="ct_composite" /><Label htmlFor="ct_composite">Composite Structure</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="load_bearing" id="ct_load_bearing" /><Label htmlFor="ct_load_bearing">Load Bearing in walls</Label></div></RadioGroup></FormRow>
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
                    </form>
                    <div className="flex justify-end gap-4 mt-12">
                        <Button type="button" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button type="button" onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    

    