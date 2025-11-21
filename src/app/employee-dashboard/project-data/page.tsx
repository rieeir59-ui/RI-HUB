
'use client';

import { useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mb-6">
    {title && <h2 className="text-lg font-bold text-primary mb-3 pb-1 border-b border-primary">{title}</h2>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, id, placeholder, type = 'text' }: { label: string; id: string; placeholder?: string; type?: string }) => (
    <div className="flex items-center gap-4">
        <Label htmlFor={id} className="w-48 text-right">{label}</Label>
        <Input id={id} name={id} placeholder={placeholder} type={type} className="flex-1" />
    </div>
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
        toast({
            title: "Download Started",
            description: "The project data PDF is being generated.",
        });
        // PDF generation logic would go here
    }
    
    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Data"
                description="A comprehensive data sheet for the project."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6 md:p-8">
                    <form id="project-data-form">
                        <Section>
                           <InputRow label="Project:" id="project_name" />
                           <InputRow label="Address:" id="project_address" />
                           <InputRow label="Owner:" id="project_owner" />
                           <InputRow label="Architect's Project No." id="architect_project_no" />
                           <InputRow label="Date:" id="project_date" type="date" />
                           <InputRow label="Tel:" id="project_tel" />
                           <InputRow label="Business Address:" id="business_address" />
                           <InputRow label="Home Address:" id="home_address" />
                           <InputRow label="Tel (Business):" id="business_tel" />
                           <InputRow label="Tel (Home):" id="home_tel" />
                        </Section>

                        <Section>
                            <InputRow label="Proposed Improvements:" id="proposed_improvements" />
                            <InputRow label="Building Dept. Classification:" id="building_classification" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Set Backs:</Label>
                                <div className="flex-1 grid grid-cols-5 gap-2">
                                    <Input name="setback_n" placeholder="N" />
                                    <Input name="setback_e" placeholder="E" />
                                    <Input name="setback_s" placeholder="S" />
                                    <Input name="setback_w" placeholder="W" />
                                    <Input name="setback_coverage" placeholder="Coverage" />
                                </div>
                            </div>
                            <InputRow label="Cost:" id="project_cost" />
                            <InputRow label="Stories:" id="project_stories" />
                            <InputRow label="Fire Zone:" id="fire_zone" />
                             <div className="flex flex-col gap-2">
                                <Label htmlFor="agency_approvals">Other Agency Standards or Approvals Required:</Label>
                                <Textarea id="agency_approvals" name="agency_approvals" />
                            </div>
                        </Section>
                        
                        <Section title="Site Legal Description">
                             <Textarea id="site_legal_description" name="site_legal_description" />
                             <InputRow label="Deed recorded in Vol." id="deed_vol" />
                             <InputRow label="Page" id="deed_page" />
                             <InputRow label="at" id="deed_at" />
                             <InputRow label="to" id="deed_to" />
                             <InputRow label="Date:" id="deed_date" type="date" />
                             <InputRow label="Restrictions:" id="restrictions" />
                             <InputRow label="Easements:" id="easements" />
                             <InputRow label="Liens, Leases:" id="liens_leases" />
                             <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Lot Dimensions:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="lot_dimensions" placeholder="Dimensions" />
                                    <Input name="lot_facing" placeholder="Facing" />
                                    <Input name="lot_value" placeholder="Value" />
                                </div>
                            </div>
                            <InputRow label="Adjacent property use:" id="adjacent_property_use" />
                        </Section>

                         <Section title="Contacts">
                            <InputRow label="Owners: Name:" id="owner_name_contact" />
                            <InputRow label="Designated Representative:" id="rep_name_contact" />
                            <InputRow label="Address:" id="contact_address" />
                            <InputRow label="Tel:" id="contact_tel" />
                            <InputRow label="Attorney at Law:" id="attorney" />
                            <InputRow label="Insurance Advisor:" id="insurance_advisor" />
                            <InputRow label="Consultant on:" id="consultant_on" />
                        </Section>

                        <Section title="Site Information Sources">
                            <InputRow label="Property Survey by:" id="survey_property" />
                            <InputRow label="Date:" id="survey_property_date" type="date" />
                            <InputRow label="Topographic Survey by:" id="survey_topo" />
                             <InputRow label="Date:" id="survey_topo_date" type="date" />
                            <InputRow label="Soils Tests by:" id="soils_tests" />
                             <InputRow label="Date:" id="soils_date" type="date" />
                            <InputRow label="Aerial Photos by:" id="aerial_photos" />
                             <InputRow label="Date:" id="aerial_date" type="date" />
                            <InputRow label="Maps:" id="maps_source" />
                        </Section>

                        <Section title="Public Services">
                            <InputRow label="Gas Company (Name, Address):" id="gas_company" />
                             <InputRow label="Representative:" id="gas_rep" />
                             <InputRow label="Tel:" id="gas_tel" />
                            <InputRow label="Electric Co (Name, Address):" id="electric_company" />
                             <InputRow label="Representative:" id="electric_rep" />
                             <InputRow label="Tel:" id="electric_tel" />
                            <InputRow label="Telephone Co (Name, Address):" id="tel_company" />
                             <InputRow label="Representative:" id="tel_rep" />
                             <InputRow label="Tel:" id="tel_tel" />
                            <InputRow label="Sewers:" id="sewers" />
                            <InputRow label="Water:" id="water" />
                        </Section>

                        <Section title="Financial Data">
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Loan:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="loan_amount" placeholder="Amount" />
                                    <Input name="loan_type" placeholder="Type" />
                                    <Input name="loan_rate" placeholder="Rate" />
                                </div>
                            </div>
                             <InputRow label="Loan by:" id="loan_by" />
                             <InputRow label="Representative:" id="loan_rep" />
                             <InputRow label="Tel:" id="loan_tel" />
                            <InputRow label="Bonds or Liens:" id="bonds_liens" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Grant:</Label>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <Input name="grant_amount" placeholder="Amount" />
                                    <Input name="grant_limitations" placeholder="Limitations" />
                                </div>
                            </div>
                             <InputRow label="Grant from:" id="grant_from" />
                             <InputRow label="Representative:" id="grant_rep" />
                             <InputRow label="Tel:" id="grant_tel" />
                        </Section>
                        
                        <Section title="Method of Handling">
                             <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Contract Type:</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2"><input type="radio" id="single_contract" name="contract_type" value="single" /><Label htmlFor="single_contract">Single</Label></div>
                                    <div className="flex items-center gap-2"><input type="radio" id="separate_contract" name="contract_type" value="separate" /><Label htmlFor="separate_contract">Separate</Label></div>
                                </div>
                            </div>
                            <InputRow label="Negotiated:" id="negotiated" />
                            <InputRow label="Bid:" id="bid" />
                            <InputRow label="Stipulated Sum:" id="stipulated_sum" />
                            <InputRow label="Cost Plus Fee:" id="cost_plus_fee" />
                            <InputRow label="Force Amount:" id="force_amount" />
                            <div className="flex items-center gap-4">
                                <Label className="w-48 text-right">Equipment:</Label>
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <Input name="equipment_fixed" placeholder="Fixed" />
                                    <Input name="equipment_movable" placeholder="Movable" />
                                    <Input name="equipment_interiors" placeholder="Interiors" />
                                </div>
                            </div>
                            <InputRow label="Landscaping:" id="landscaping" />
                        </Section>

                        <Section title="Sketch of Property">
                             <div className="flex flex-col gap-2">
                                <Label htmlFor="sketch_notes">Notations on existing improvements, disposal thereof, utilities, tree, etc.; indicated North; notations on other Project provision:</Label>
                                <Textarea id="sketch_notes" name="sketch_notes" rows={5} />
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
