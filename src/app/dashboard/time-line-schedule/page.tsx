
'use client';

import { CheckCircle, Circle, Milestone } from 'lucide-react';

const timelineData = [
    {
        phase: 'Project Initiation & Site Studies',
        tasks: [
            'Client Brief',
            'Project Scope and Area Statements',
            'Topographic / Preliminary Survey',
            'Geotechnical Investigation and Report',
        ],
    },
    {
        phase: 'Concept Design Stage',
        tasks: [
            'Concept Design Development',
            'Concept Plans and Supporting Drawings',
            'Interior Design Concept Development',
            'Finalization of Concept Design Report',
            'Client Approval on Concept Design',
        ],
    },
    {
        phase: 'Preliminary Design Stage',
        tasks: [
            'Preliminary Design and Layout Plan – Cycle 1',
            'Initial Engineering Coordination (Structural / MEP)',
            'Layout Plan – Cycle 2 (Refined Based on Feedback)',
            'Environmental Study (if applicable)',
            'Authority Pre-Consultation / Coordination (LDA, CDA, etc.)',
            '3D Model Development',
            'Elevations and Sections',
            'Preliminary Interior Layout',
            'Preliminary Engineering Design',
            'Finalization of Preliminary Design Report',
            'Client Comments / Approval on Preliminary Design',
        ],
    },
    {
        phase: 'Authority Submission Stage',
        tasks: [
            'Preparation of Submission Drawings',
            'Submission to LDA / CDA / Other Relevant Authority',
            'Application for Stage-1 Approval',
            'Authority Approval Process (Review, Comments, Compliance)',
            'Receipt of Authority Approval (Stage-1)',
        ],
    },
    {
        phase: 'Detailed Design and Tender Preparation Stage',
        tasks: [
            'Detailed Architectural Design',
            'Detailed Interior Layout',
            'Detailed Engineering Designs (Structural / MEP)',
            'Draft Conditions of Contract',
            'Draft BOQs and Technical Specifications',
            'Client Comments and Approvals on Detailed Design',
            'Finalization of Detailed Design',
        ],
    },
    {
        phase: 'Construction Design and Tender Finalization Stage',
        tasks: [
            'Construction Design and Final Tender Preparation',
            'Architectural Construction Drawings',
            'Engineering Construction Drawings',
            'Final Tender Documents',
            'Client Comments / Approval on Final Tender Documents',
            'Tender Documents Ready for Issue',
        ],
    },
    {
        phase: 'Interior Design Development Stage',
        tasks: [
            'Final Interior Design Development',
            'Interior Layout Working Details',
            'Interior Thematic Mood Board and Color Scheme',
            'Ceiling Detail Design Drawings',
            'Built-in Feature Details',
            'Partition and Pattern Detail Drawings',
            'Draft Interior Design Tender',
            'Client Comments / Approval on Interior Design Development',
            'Client Comments / Approval on Interior Design Tender',
            'Finalization of Interior Design Tender',
        ],
    },
    {
        phase: 'Procurement & Appointment Stage',
        tasks: [
            'Procurement of Main Contractor',
            'Contract Award / Mobilization',
        ],
    },
];

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-headline text-primary text-center mb-12">
        Architectural Project Timeline
      </h1>

      <div className="relative">
        {/* The vertical line */}
        <div className="absolute left-1/2 -ml-px w-0.5 h-full bg-border" />

        {timelineData.map((item, index) => (
          <div key={index} className="relative mb-12">
            <div className="flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-1/2 -ml-4 z-10 bg-background p-1.5 rounded-full border-2 border-primary">
                <Milestone className="h-5 w-5 text-primary" />
              </div>
              <div className={`w-1/2 pr-8 ${index % 2 === 0 ? 'text-right' : ''}`}>
                 {index % 2 !== 0 && <div className="p-6 rounded-lg shadow-md border bg-card text-card-foreground invisible"></div>}
              </div>
               <div className={`w-1/2 pl-8 ${index % 2 !== 0 ? 'text-left' : ''}`}>
                {index % 2 === 0 && <div className="p-6 rounded-lg shadow-md border bg-card text-card-foreground invisible"></div>}
              </div>
            </div>

            {/* Content Card */}
            <div className={`w-[calc(50%-2rem)] absolute top-0 ${index % 2 === 0 ? 'left-0' : 'right-0'}`}>
              <div className="p-6 rounded-lg shadow-md border bg-card text-card-foreground">
                <h2 className={`font-headline text-xl font-bold mb-4 ${index % 2 === 0 ? 'text-right' : 'text-left'} text-primary`}>
                  {index + 1}. {item.phase}
                </h2>
                <ul className="space-y-2">
                  {item.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className={`flex items-start gap-3 ${index % 2 === 0 ? 'justify-end flex-row-reverse' : ''}`}>
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <span className={`text-sm text-muted-foreground ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
