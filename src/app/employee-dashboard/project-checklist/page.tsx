
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const checklistData = {
  predesign: {
    title: '1: - Predesign',
    sections: {
      predesignServices: {
        title: 'Predesign Services:',
        items: [
          'Project Administration',
          'Disciplines Coordination Document Checking',
          'Agency Consulting Review/ Approval',
          'Coordination Of Owner Supplied Data',
          'Programming',
          'Space Schematics/ Flow Diagrams',
          'Existing Facilities Surveys',
          'Presentations',
        ],
      },
      siteAnalysis: {
        title: 'Site Analysis Services',
        items: [
          'Project Administration',
          'Disciplines Coordination Document Checking',
          'Agency Consulting Review/ Approval',
          'Coordination Of Owner Supplied Data',
          'Site Analysis and Selection',
          'Site Development and Planning',
          'Detailed Site Utilization Studies',
          'Onsite Utility Studies',
          'Offsite Utility Studies',
          'Zoning Processing Assistance',
          'Project Development Scheduling',
          'Project Budgeting',
          'Presentations',
        ],
      },
    },
  },
  design: {
    title: '2: - Design',
    sections: {
      schematicDesign: {
        title: 'Schematic Design Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design/ Documentation',
            'Electrical Design/ Documentation',
            'Civil Design/ Documentation',
            'Landscape Design/ Documentation',
            'Interior Design/ Documentation',
            'Materials Research/ Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
      designDevelopment: {
        title: 'Design Development Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design / Documentation',
            'Electrical Design / Documentation',
            'Civil Design / Documentation',
            'Landscape Design / Documentation',
            'Interior Design / Documentation',
            'Materials Research / Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
      constructionDocuments: {
        title: 'Construction Documents Services:',
        items: [
            'Project Administration',
            'Disciplines Coordination Document Checking',
            'Agency Consulting Review/ Approval',
            'Coordination Of Owner Supplied Data',
            'Architectural Design/ Documentation',
            'Structural Design/ Documentation',
            'Mechanical Design/ Documentation',
            'Electrical Design / Documentation',
            'Civil Design/ Documentation',
            'Landscape Design/ Documentation',
            'Interior Design/ Documentation',
            'Materials Research / Specifications',
            'Project Development Scheduling',
            'Statement Of Probable Construction Cost',
            'Presentations',
        ],
      },
    },
  },
  construction: {
    title: '3: - Construction',
    sections: {
        bidding: {
            title: 'Bidding Or Negotiation Services:',
            items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Bidding Materials',
                'Addenda',
                'Bidding Negotiations',
                'Analysis Of Alternates/ Substitutions',
                'Special Bidding Services',
                'Bid Evaluation',
                'Construction Contract Agreements',
            ],
        },
        contractAdmin: {
            title: 'Construction Contract Administration Services:',
            items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Office Construction Administration',
                'Construction Field Observation',
                'Project Representation',
                'Inspection Coordination',
                'Supplemental Documents',
                'Quotation Requests/ Change Orders',
                'Project Schedule Monitoring',
                'Construction Cost Accounting',
                'Project Closeout',
            ],
        },
    },
  },
  postConstruction: {
      title: '4: - Post Construction',
      sections: {
          postConstruction: {
              title: 'Post Construction Services:',
              items: [
                'Project Administration',
                'Disciplines Coordination Document Checking',
                'Agency Consulting Review/ Approval',
                'Coordination Of Owner Supplied Data',
                'Maintenance And Operational Programming',
                'Start Up Assistance',
                'Record Drawings',
                'Warranty Review',
                'Post Construction Evaluation',
              ],
          },
      },
  },
  supplemental: {
      title: '5: - Supplemental',
      sections: {
          supplemental: {
              title: 'Supplemental Services:',
              items: [
                'Graphics Design',
                'Fine Arts and Crafts Services',
                'Special Furnishing Design',
                'Non-Building Equipment Selection',
              ],
          },
          materials: {
              title: 'List Of Materials:',
              items: [
                'Conceptual Site and Building Plans/ Basic Layout',
                'Preliminary Sections and Elevations',
                'Air Conditioning/ H.V.A.C Design',
                'Plumbing',
                'Fire Protection',
                'Special Mechanical Systems',
                'General Space Requirements',
                'Power Services and Distribution',
                'Telephones',
                'Security Systems',
                'Special Electrical Systems',
                'Landscaping',
                'Materials',
                'Partition Sections',
                'Furniture Design',
                'Identification Of Potential Architectural Materials',
                'Specification Of a. Wall Finishes',
                'b. Floor Finishes',
                'c. Windows Coverings',
                'd. Carpeting',
                'Specialized Features Construction Details',
                'Project Administration',
                'Space Schematic Flow',
                'Existing Facilities Services',
                'Project Budgeting',
                'Presentation',
              ],
          },
      },
  },
};

type ChecklistState = {
    [mainKey: string]: {
        [subKey: string]: boolean[]
    }
};

const initializeState = (): ChecklistState => {
    const initialState: ChecklistState = {};
    for (const mainKey in checklistData) {
        initialState[mainKey] = {};
        const mainSection = checklistData[mainKey as keyof typeof checklistData];
        for (const subKey in mainSection.sections) {
            const subSection = mainSection.sections[subKey as keyof typeof mainSection.sections];
            initialState[mainKey][subKey] = Array(subSection.items.length).fill(false);
        }
    }
    return initialState;
};


const ChecklistItem = ({ item, checked, onCheckedChange }: { item: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => {
    return (
        <div className={`flex items-start space-x-3 py-1 item-container ${!checked ? 'print-hide' : ''}`}>
            <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
            <div className="flex-grow">{item}</div>
        </div>
    );
};

export default function ProjectChecklistPage() {
    const { toast } = useToast();
    const [checkedItems, setCheckedItems] = useState<ChecklistState>(initializeState());

    const handleCheckboxChange = (mainKey: string, subKey: string, itemIndex: number, checked: boolean) => {
        setCheckedItems(prevState => {
            const newState = { ...prevState };
            newState[mainKey][subKey][itemIndex] = checked;
            return newState;
        });
    };
    
    const getSelectedItems = () => {
        const selected: { [key: string]: string[] } = {};
        for (const mainKey in checklistData) {
            const mainSection = checklistData[mainKey as keyof typeof checklistData];
            for (const subKey in mainSection.sections) {
                const subSection = mainSection.sections[subKey as keyof typeof mainSection.sections];
                const items = subSection.items.filter((_, index) => checkedItems[mainKey][subKey][index]);
                if (items.length > 0) {
                    if (!selected[subSection.title]) {
                        selected[subSection.title] = [];
                    }
                    selected[subSection.title].push(...items);
                }
            }
        }
        return selected;
    };

    const handleSave = () => {
        const selectedData = getSelectedItems();
        // Here you would typically save `selectedData` to a database.
        // For now, we'll just show a toast.
        console.log("Data to save:", selectedData);
        toast({
            title: "Record Saved",
            description: "Your selected checklist items have been saved.",
        });
    };
    
    const handleDownload = () => {
        toast({
            title: "Download Started",
            description: "Your checklist is being prepared for download.",
        });
        window.print();
    };

    return (
        <div className="bg-white p-8 md:p-12 lg:p-16 text-black rounded-lg shadow-lg">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area .print-hide {
                        display: none;
                    }
                    .printable-area .no-print {
                        display: none;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
            
            <div className="printable-area">
                <h1 className="text-2xl font-bold text-center mb-10">PROJECT CHECKLIST</h1>

                <div className="space-y-4 mb-10">
                    <div className="flex items-center">
                        <Label htmlFor="project-name" className="w-48 font-semibold">Project:</Label>
                        <Input id="project-name" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="architect" className="w-48 font-semibold">Name, Address: Architect:</Label>
                        <Input id="architect" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="project-no" className="w-48 font-semibold">Architect Project No:</Label>
                        <Input id="project-no" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="project-date" className="w-48 font-semibold">Project Date:</Label>
                        <Input id="project-date" type="date" className="border-0 border-b-2 rounded-none p-0 focus-visible:ring-0" />
                    </div>
                </div>

                <div className="space-y-8">
                    {Object.entries(checklistData).map(([mainKey, mainSection]) => (
                        <div key={mainSection.title}>
                            <h2 className="text-xl font-bold mb-4">{mainSection.title}</h2>
                            <div className="space-y-6">
                                {Object.entries(mainSection.sections).map(([subKey, subSection]) => (
                                    <div key={subSection.title} className="pl-4">
                                        <h3 className="font-semibold underline mb-2">{subSection.title}</h3>
                                        <div className="space-y-1">
                                            {subSection.items.map((item, index) => (
                                                <ChecklistItem 
                                                    key={index} 
                                                    item={item}
                                                    checked={checkedItems[mainKey]?.[subKey]?.[index] ?? false}
                                                    onCheckedChange={(checked) => handleCheckboxChange(mainKey, subKey, index, !!checked)}
                                                />
                                            ))}
                                        </div>
                                    </div>
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

