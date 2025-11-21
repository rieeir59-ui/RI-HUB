
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const factorsData = {
  humanFactors: {
    title: 'Human Factors',
    items: [
      { label: 'Activities', level: 0 },
      { label: 'Behavior', level: 0 },
      { label: 'Objectives / Goals', level: 0 },
      { label: 'Organization', level: 0 },
      { label: 'Hierarchy', level: 1 },
      { label: 'Groups', level: 2 },
      { label: 'Positions', level: 2 },
      { label: 'Classifications', level: 2 },
      { label: 'Leadership', level: 3 },
      { label: 'Characteristics', level: 0 },
      { label: '(Demographics)', level: 1 },
      { label: 'Social Forces', level: 0 },
      { label: 'Political Forces', level: 0 },
      { label: 'Interactions', level: 0 },
      { label: 'Communication', level: 1 },
      { label: 'Relationships', level: 1 },
      { label: 'Transfer of materials', level: 2 },
      { label: 'Policies / Codes', level: 0 },
      { label: 'Attitudes / Values', level: 0 },
      { label: 'Customs / Beliefs', level: 0 },
      { label: 'Perceptions', level: 0 },
      { label: 'Preferences', level: 0 },
      { label: 'Qualities', level: 0 },
      { label: 'Comfort', level: 1 },
      { label: 'Productivity', level: 2 },
      { label: 'Efficiency', level: 2 },
      { label: 'Security', level: 1 },
      { label: 'Safety', level: 1 },
      { label: 'Access', level: 1 },
      { label: 'Privacy', level: 2 },
      { label: 'Territory', level: 2 },
      { label: 'Control', level: 1 },
      { label: 'Convenience', level: 2 },
    ],
  },
  physicalFactors: {
    title: 'Physical Factors',
    items: [
      { label: 'Location', level: 0 },
      { label: 'Region', level: 1 },
      { label: 'Locality', level: 1 },
      { label: 'Community', level: 1 },
      { label: 'Vicinity', level: 1 },
      { label: 'Site Conditions', level: 0 },
      { label: 'Building / Facility', level: 0 },
      { label: 'Envelope', level: 0 },
      { label: 'Structure', level: 0 },
      { label: 'Systems', level: 0 },
      { label: 'Engineering', level: 1 },
      { label: 'Communications', level: 2 },
      { label: 'Lighting', level: 2 },
      { label: 'Security', level: 2 },
      { label: 'Space', level: 0 },
      { label: 'Types', level: 1 },
      { label: 'Dimensions', level: 1 },
      { label: 'Relationship', level: 1 },
      { label: 'Equipment / Furnishings', level: 0 },
      { label: 'Materials / Finishes', level: 0 },
      { label: 'Support Services', level: 0 },
      { label: 'Storage', level: 1 },
      { label: 'Parking', level: 1 },
      { label: 'Access', level: 1 },
      { label: 'Waste removal', level: 1 },
      { label: 'Utilities (water, sewage, telephone)', level: 1 },
      { label: 'Uses', level: 0 },
      { label: 'Functions', level: 0 },
      { label: 'Behavior / Activity Settings', level: 0 },
      { label: 'Operations', level: 0 },
      { label: 'Circulation', level: 0 },
      { label: 'Environment', level: 0 },
      { label: 'Comfort', level: 1 },
      { label: 'Visual', level: 1 },
      { label: 'Acoustical', level: 1 },
      { label: 'Energy Use / Conservation', level: 0 },
      { label: 'Durability / Flexibility', level: 0 },
    ],
  },
  externalFactors: {
    title: 'External Factors',
    items: [
      { label: 'Legal Restrictions', level: 0 },
      { label: '(Codes / Standards / Regulations)', level: 1 },
      { label: 'Building', level: 2 },
      { label: 'Land use', level: 2 },
      { label: 'Systems', level: 2 },
      { label: 'Energy', level: 2 },
      { label: 'Environment', level: 2 },
      { label: 'Materials', level: 2 },
      { label: 'Safety', level: 2 },
      { label: 'Solar access', level: 1 },
      { label: 'Topography', level: 0 },
      { label: 'Climate', level: 0 },
      { label: 'Ecology', level: 0 },
      { label: 'Resource Availability', level: 0 },
      { label: 'Energy Supplies / Prices', level: 0 },
      { label: 'Conventional', level: 1 },
      { label: 'Solar', level: 1 },
      { label: 'Alternatives', level: 1 },
      { label: 'Economy', level: 0 },
      { label: 'Financing', level: 0 },
      { label: 'Time', level: 0 },
      { label: 'Schedule', level: 1 },
      { label: 'Deadlines', level: 2 },
      { label: 'Operations', level: 2 },
      { label: 'Costs / Budget', level: 0 },
      { label: 'Construction', level: 1 },
      { label: 'Material', level: 2 },
      { label: 'Services', level: 2 },
      { label: 'Operations', level: 2 },
      { label: 'Cost / Benefits', level: 0 },
    ],
  },
};

const ChecklistItem = ({ item }: { item: { label: string; level: number } }) => {
  return (
    <div className="flex items-start">
      <div style={{ paddingLeft: `${item.level * 1.5}rem` }} className="flex items-start flex-1">
        <Checkbox id={item.label.replace(/\s+/g, '-')} className="mt-1" />
        <Label htmlFor={item.label.replace(/\s+/g, '-')} className="ml-3 flex-1">{item.label}</Label>
      </div>
    </div>
  );
};


export default function PredesignAssessmentPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Record Saved",
      description: "The predesign assessment has been saved.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your predesign assessment PDF is being generated.",
    });
    // Add actual PDF generation logic here if needed
  };

  return (
    <div className="bg-white p-8 md:p-12 lg:p-16 text-black rounded-lg shadow-lg">
      <div className="printable-area">
        <h1 className="text-xl font-bold mb-2">PREDESIGN</h1>
        <h1 className="text-xl font-bold mb-6">ASSESSMENT</h1>

        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
                <Label htmlFor="project-name" className="w-24">Project:</Label>
                <Input id="project-name" placeholder="(Name, Address)" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
            </div>
             <div className="flex items-center gap-4">
                <Label htmlFor="architect" className="w-24">Architect:</Label>
                <Input id="architect" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
            </div>
            <div className="flex items-center gap-4">
                <Label htmlFor="project-no" className="w-36">Architects Project No:</Label>
                <Input id="project-no" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
            </div>
            <div className="flex items-center gap-4">
                <Label htmlFor="project-date" className="w-28">Project Date:</Label>
                <Input id="project-date" type="date" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(factorsData).map((factor) => (
            <div key={factor.title} className="border-t-2 border-b-2 border-black py-2">
              <h2 className="font-bold text-center border-b-2 border-black pb-1 mb-2">{factor.title}</h2>
              <div className="space-y-3">
                {factor.items.map((item, index) => (
                  <ChecklistItem key={index} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-12 no-print">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
        <Button onClick={handleDownload} variant="outline" className="text-black border-black hover:bg-gray-200"><Download className="mr-2 h-4 w-4" /> Download/Print PDF</Button>
      </div>
    </div>
  );
}
