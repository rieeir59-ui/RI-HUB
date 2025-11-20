
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckSquare } from 'lucide-react';

const ServiceList = ({ items }: { items: string[] }) => (
    <ul className="space-y-2 pl-6">
        {items.map((item, index) => (
            <li key={index} className="flex items-start">
                <CheckSquare className="h-5 w-5 text-primary mr-2 mt-1 shrink-0" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const predesignServices = {
    "Predesign Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Programming", "Space Schematics/ Flow Diagrams", "Existing Facilities Surveys", "Presentations"
    ],
    "Site Analysis Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Site Analysis and Selection", "Site Development and Planning", "Detailed Site Utilization Studies", "Onsite Utility Studies", "Offsite Utility Studies", "Zoning Processing Assistance", "Project Development Scheduling", "Project Budgeting", "Presentations"
    ]
};

const designServices = {
    "Schematic Design Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design/ Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research/ Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"
    ],
    "Design Development Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design / Documentation", "Electrical Design / Documentation", "Civil Design / Documentation", "Landscape Design / Documentation", "Interior Design / Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"
    ],
    "Construction Documents Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Architectural Design/ Documentation", "Structural Design/ Documentation", "Mechanical Design/ Documentation", "Electrical Design / Documentation", "Civil Design/ Documentation", "Landscape Design/ Documentation", "Interior Design/ Documentation", "Materials Research / Specifications", "Project Development Scheduling", "Statement Of Probable Construction Cost", "Presentations"
    ]
};

const constructionServices = {
    "Bidding Or Negotiation Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Bidding Materials", "Addenda", "Bidding Negotiations", "Analysis Of Alternates/ Substitutions", "Special Bidding Services", "Bid Evaluation", "Construction Contract Agreements"
    ],
    "Construction Contract Administration Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Office Construction Administration", "Construction Field Observation", "Project Representation", "Inspection Coordination", "Supplemental Documents", "Quotation Requests/ Change Orders", "Project Schedule Monitoring", "Construction Cost Accounting", "Project Closeout"
    ]
};

const postConstructionServices = {
    "Post Construction Services": [
        "Project Administration", "Disciplines Coordination Document Checking", "Agency Consulting Review/ Approval", "Coordination Of Owner Supplied Data", "Maintenance And Operational Programming", "Start Up Assistance", "Record Drawings", "Warranty Review", "Post Construction Evaluation"
    ]
};

const supplementalServices = {
    "Supplemental Services": [
        "Graphics Design", "Fine Arts and Crafts Services", "Special Furnishing Design", "Non-Building Equipment Selection"
    ],
    "List Of Materials": [
        "Conceptual Site and Building Plans/ Basic Layout", "Preliminary Sections and Elevations", "Air Conditioning/ H.V.A.C Design", "Plumbing", "Fire Protection", "Special Mechanical Systems", "General Space Requirements", "Power Services and Distribution", "Telephones", "Security Systems", "Special Electrical Systems", "Landscaping", "Materials", "Partition Sections", "Furniture Design", "Identification Of Potential Architectural Materials", "Specification Of a. Wall Finishes", "b. Floor Finishes", "c. Windows Coverings", "d. Carpeting", "Specialized Features Construction Details", "Project Administration", "Space Schematic Flow", "Existing Facilities Services", "Project Budgeting", "Presentation"
    ]
};


export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 md:py-24 space-y-8">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-headline text-primary">Our Services</CardTitle>
              <CardContent className="text-base md:text-lg text-muted-foreground pt-4">
                <p>
                  We offer a comprehensive range of architectural and design services to bring your vision to life.
                </p>
              </CardContent>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="predesign">
                    <AccordionTrigger className="text-2xl font-semibold">1: Predesign</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full pl-4">
                            {Object.entries(predesignServices).map(([title, items]) => (
                                <AccordionItem value={title} key={title}>
                                    <AccordionTrigger className="text-xl">{title}</AccordionTrigger>
                                    <AccordionContent>
                                        <ServiceList items={items} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="design">
                    <AccordionTrigger className="text-2xl font-semibold">2: Design</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full pl-4">
                            {Object.entries(designServices).map(([title, items]) => (
                                <AccordionItem value={title} key={title}>
                                    <AccordionTrigger className="text-xl">{title}</AccordionTrigger>
                                    <AccordionContent>
                                        <ServiceList items={items} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="construction">
                    <AccordionTrigger className="text-2xl font-semibold">3: Construction</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full pl-4">
                            {Object.entries(constructionServices).map(([title, items]) => (
                                <AccordionItem value={title} key={title}>
                                    <AccordionTrigger className="text-xl">{title}</AccordionTrigger>
                                    <AccordionContent>
                                        <ServiceList items={items} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="post-construction">
                    <AccordionTrigger className="text-2xl font-semibold">4: Post-Construction</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full pl-4">
                            {Object.entries(postConstructionServices).map(([title, items]) => (
                                <AccordionItem value={title} key={title}>
                                    <AccordionTrigger className="text-xl">{title}</AccordionTrigger>
                                    <AccordionContent>
                                        <ServiceList items={items} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="supplemental">
                    <AccordionTrigger className="text-2xl font-semibold">5: Supplemental</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="single" collapsible className="w-full pl-4">
                            {Object.entries(supplementalServices).map(([title, items]) => (
                                <AccordionItem value={title} key={title}>
                                    <AccordionTrigger className="text-xl">{title}</AccordionTrigger>
                                    <AccordionContent>
                                        <ServiceList items={items} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
