
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';
import DashboardPageHeader from '@/components/dashboard/PageHeader';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const checklistData = {
  predesign: {
    title: 'Predesign',
    sections: {
      predesignServices: {
        title: 'Predesign Services',
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
    title: 'Design',
    sections: {
      schematicDesign: {
        title: 'Schematic Design Services',
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
        title: 'Design Development Services',
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
        title: 'Construction Documents Services',
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
    title: 'Construction',
    sections: {
        bidding: {
            title: 'Bidding Or Negotiation Services',
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
            title: 'Construction Contract Administration Services',
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
      title: 'Post-Construction',
      sections: {
          postConstruction: {
              title: 'Post Construction Services',
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
      title: 'Supplemental',
      sections: {
          supplemental: {
              title: 'Supplemental Services',
              items: [
                'Graphics Design',
                'Fine Arts and Crafts Services',
                'Special Furnishing Design',
                'Non-Building Equipment Selection',
              ],
          },
          materials: {
              title: 'List Of Materials',
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

const ChecklistItem = ({ item, id }: { item: string, id: string }) => {
    return (
        <div className="flex items-center space-x-3 py-2">
            <Checkbox id={id} />
            <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {item}
            </Label>
        </div>
    );
};

export default function ProjectChecklistPage() {
    const image = PlaceHolderImages.find(p => p.id === 'project-checklist');
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Record Saved",
            description: "Your checklist has been saved successfully.",
        });
    };
    
    const handleDownload = () => {
        toast({
            title: "Download Started",
            description: "Your checklist is being prepared for download.",
        });
    };

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Project Checklist"
                description="Track project tasks with a checklist."
                imageUrl={image?.imageUrl || ''}
                imageHint={image?.imageHint || ''}
            />

            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name, Address</Label>
                            <Input id="project-name" placeholder="Enter project name and address" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="architect">Architect</Label>
                            <Input id="architect" placeholder="Enter architect's name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-no">Architect Project No</Label>
                            <Input id="project-no" placeholder="Enter project number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-date">Project Date</Label>
                            <Input id="project-date" type="date" />
                        </div>
                    </div>
                    
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(checklistData).map(([key, mainSection]) => (
                            <AccordionItem value={key} key={key}>
                                <AccordionTrigger className="text-2xl font-headline text-primary bg-muted/50 px-4 rounded-md">
                                    {mainSection.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 space-y-6">
                                    {Object.entries(mainSection.sections).map(([sectionKey, subSection]) => (
                                        <div key={sectionKey} className="space-y-2">
                                            <h3 className="text-lg font-semibold border-b pb-2">{subSection.title}</h3>
                                            <div className="pt-2 pl-2">
                                                {subSection.items.map((item, index) => (
                                                    <ChecklistItem key={index} item={item} id={`${sectionKey}-${index}`} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button onClick={handleDownload} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
