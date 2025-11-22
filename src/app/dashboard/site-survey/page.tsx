'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        // PDF generation logic will be implemented later based on the final form structure.
        toast({ title: 'Coming Soon', description: 'PDF download functionality will be implemented.' });
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
                    <Section title="Location">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                             <div className="flex items-center gap-4">
                                <Label className="font-semibold">Purpose</Label>
                                <div className="flex items-center gap-4"><Checkbox id="purpose_house" /> <Label htmlFor="purpose_house">House</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="purpose_other_check" /> <Label htmlFor="purpose_other_check">Other:</Label> <Input id="purpose_other_text" /></div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Label className="font-semibold" htmlFor="location_date">Date:</Label>
                                <Input type="date" id="location_date" />
                             </div>
                        </div>
                        <Input id="location_city" placeholder="City" />
                        <Input id="location_region" placeholder="Region" />
                        <Input id="location_address" placeholder="Address" />
                    </Section>

                     <Section title="Legal File">
                        <Input id="legal_owner_name" placeholder="Name of Owner" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-b py-2">
                            <Label>Is Completion Certificate available</Label>
                            <RadioGroup name="completion_cert" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cc_yes" /><Label htmlFor="cc_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cc_no" /><Label htmlFor="cc_no">No</Label></div>
                            </RadioGroup>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Is the property leased</Label>
                            <RadioGroup name="is_leased" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="leased_yes" /><Label htmlFor="leased_yes">Yes</Label></div>
                                <Label>As informed by Owner Representative</Label>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="leased_no" /><Label htmlFor="leased_no">No</Label></div>
                            </RadioGroup>
                        </div>
                    </Section>

                    <Section title="Area">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Label>Dimension</Label>
                                <p className="text-xs text-muted-foreground">Attach as-built plan(s)</p>
                            </div>
                            <Input placeholder="Maximum frontage:" className="md:col-span-1" />
                            <Input placeholder="Maximum Depth:" className="md:col-span-1" />
                        </div>
                        <Input placeholder="Total Area in Sqft" />
                        <Input placeholder="Minimum clear height (Floor to Roof) in ft" />
                        <Input placeholder="Building plot size of which premises is a part" />
                        <Input placeholder="Covered Area" />
                        <Input placeholder="No. of Stories / floors (mention mezzanine, basement, roof parapet wall etc.) If any." />
                    </Section>

                     <Section title="Building overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-b py-2">
                            <Label>Independent premises</Label>
                             <RadioGroup name="independent_premises" className="flex items-center justify-between">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ind_yes" /><Label htmlFor="ind_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ind_no" /><Label htmlFor="ind_no">No. a part of building</Label></div>
                            </RadioGroup>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Status</Label>
                             <RadioGroup name="property_status" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="status_comm" /><Label htmlFor="status_comm">Commercial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="status_res" /><Label htmlFor="status_res">Residential</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="industrial" id="status_ind" /><Label htmlFor="status_ind">Industrial</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="status_other" /><Label htmlFor="status_other">Other:</Label> <Input className="h-7" /></div>
                            </RadioGroup>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Type of Premises</Label>
                             <RadioGroup name="premises_type" className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="residence" id="prem_res" /><Label htmlFor="prem_res">Residence</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="offices" id="prem_off" /><Label htmlFor="prem_off">Offices</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="godowns" id="prem_god" /><Label htmlFor="prem_god">Godowns</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="prem_other" /><Label htmlFor="prem_other">Other:</Label> <Input className="h-7" /></div>
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Age of Premises if any</Label>
                            <RadioGroup name="building_age" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="0-5" id="age_0_5" /><Label htmlFor="age_0_5">0-5</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="5-10" id="age_5_10" /><Label htmlFor="age_5_10">5-10</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value=">10" id="age_gt_10" /><Label htmlFor="age_gt_10">More than 10 years</Label></div></RadioGroup>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Interior of Premises if any</Label>
                            <RadioGroup name="interior_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="single_hall" id="it_single_hall" /><Label htmlFor="it_single_hall">Single Hall</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="rooms" id="it_rooms" /><Label htmlFor="it_rooms">Rooms</Label></div></RadioGroup>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b py-2">
                            <Label>Type of construction</Label>
                            <RadioGroup name="construction_type" className="flex flex-wrap gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="rcc" id="ct_rcc" /><Label htmlFor="ct_rcc">Beam-Column in RCC</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="composite" id="ct_composite" /><Label htmlFor="ct_composite">Composit Structure</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="load_bearing" id="ct_load_bearing" /><Label htmlFor="ct_load_bearing">Load Bearing in walls</Label></div></RadioGroup>
                        </div>
                    </Section>

                     <Section title="Building Details">
                        <FormRow label="Seepage">
                             <RadioGroup name="seepage" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="seepage_yes" /><Label htmlFor="seepage_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="seepage_no" /><Label htmlFor="seepage_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                        <FormRow label="Area of seepage (Walls, slab etc.)"><Input id="seepage_area" /></FormRow>
                        <FormRow label="Cause of Seepage"><Input id="seepage_cause" /></FormRow>
                        <FormRow label="Property Utilization">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="util_residential" /><Label htmlFor="util_residential">Fully residential</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_commercial" /><Label htmlFor="util_commercial">Fully Commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_dual" /><Label htmlFor="util_dual">Dual use residential & commercial</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="util_industrial" /><Label htmlFor="util_industrial">Industrial</Label></div>
                            </div>
                        </FormRow>
                         <FormRow label="Condition of roof waterproofing (if applicable)"><Input id="roof_waterproofing" /></FormRow>
                        <FormRow label="Parking available">
                             <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="parking_yes" /><Label htmlFor="parking_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_main_road" /><Label htmlFor="parking_main_road">On Main Road</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="parking_no" /><Label htmlFor="parking_no">No</Label></div>
                            </div>
                        </FormRow>
                        <FormRow label="Approachable through Road">
                             <RadioGroup name="approachable" className="flex items-center space-x-8">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="approachable_yes" /><Label htmlFor="approachable_yes">Yes</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="approachable_no" /><Label htmlFor="approachable_no">No</Label></div>
                            </RadioGroup>
                        </FormRow>
                         <FormRow label="Wall masonary material as per region"><Input id="wall_material" /></FormRow>
                        <FormRow label="Major retainable building elements">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_water_tank" /><Label htmlFor="retainable_water_tank">Water tank</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_subflooring" /><Label htmlFor="retainable_subflooring">Subflooring</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_staircase" /><Label htmlFor="retainable_staircase">staircase</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="retainable_other_check" /><Label htmlFor="retainable_other_check">Others</Label><Input id="retainable_other_text" className="h-7" /></div>
                            </div>
                        </FormRow>
                        <FormRow label="Incase of Plot provide existing level from road & surrounding buildings"><Input id="plot_level" /></FormRow>
                        <FormRow label="Building Control Violations">
                             <div className="flex flex-wrap items-center gap-4">
                                 <RadioGroup name="violations" className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="major" id="violation_major" /><Label htmlFor="violation_major">Major</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="minor" id="violation_minor" /><Label htmlFor="violation_minor">Minor</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="violation_none" /><Label htmlFor="violation_none">No Deviation</Label></div>
                                </RadioGroup>
                                 <div className="flex items-center space-x-2"><Checkbox id="violation_informed" /><Label htmlFor="violation_informed">As Informed by Owner Representative</Label></div>
                            </div>
                        </FormRow>
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
