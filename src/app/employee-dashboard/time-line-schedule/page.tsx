
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface Task {
  id: number;
  text: string;
}

interface Phase {
  id: number;
  title: string;
  tasks: Task[];
}

const initialTimelineData: Phase[] = [
    {
        id: 1,
        phase: 'Project Initiation & Site Studies',
        tasks: [
            { id: 1, text: 'Client Brief' },
            { id: 2, text: 'Project Scope and Area Statements' },
            { id: 3, text: 'Topographic / Preliminary Survey' },
            { id: 4, text: 'Geotechnical Investigation and Report' },
        ],
    },
    {
        id: 2,
        phase: 'Concept Design Stage',
        tasks: [
            { id: 1, text: 'Concept Design Development' },
            { id: 2, text: 'Concept Plans and Supporting Drawings' },
            { id: 3, text: 'Interior Design Concept Development' },
            { id: 4, text: 'Finalization of Concept Design Report' },
            { id: 5, text: 'Client Approval on Concept Design' },
        ],
    },
    {
        id: 3,
        phase: 'Preliminary Design Stage',
        tasks: [
            { id: 1, text: 'Preliminary Design and Layout Plan – Cycle 1' },
            { id: 2, text: 'Initial Engineering Coordination (Structural / MEP)' },
            { id: 3, text: 'Layout Plan – Cycle 2 (Refined Based on Feedback)' },
            { id: 4, text: 'Environmental Study (if applicable)' },
            { id: 5, text: 'Authority Pre-Consultation / Coordination (LDA, CDA, etc.)' },
            { id: 6, text: '3D Model Development' },
            { id: 7, text: 'Elevations and Sections' },
            { id: 8, text: 'Preliminary Interior Layout' },
            { id: 9, text: 'Preliminary Engineering Design' },
            { id: 10, text: 'Finalization of Preliminary Design Report' },
            { id: 11, text: 'Client Comments / Approval on Preliminary Design' },
        ],
    },
    {
        id: 4,
        phase: 'Authority Submission Stage',
        tasks: [
            { id: 1, text: 'Preparation of Submission Drawings' },
            { id: 2, text: 'Submission to LDA / CDA / Other Relevant Authority' },
            { id: 3, text: 'Application for Stage-1 Approval' },
            { id: 4, text: 'Authority Approval Process (Review, Comments, Compliance)' },
            { id: 5, text: 'Receipt of Authority Approval (Stage-1)' },
        ],
    },
    {
        id: 5,
        phase: 'Detailed Design and Tender Preparation Stage',
        tasks: [
            { id: 1, text: 'Detailed Architectural Design' },
            { id: 2, text: 'Detailed Interior Layout' },
            { id: 3, text: 'Detailed Engineering Designs (Structural / MEP)' },
            { id: 4, text: 'Draft Conditions of Contract' },
            { id: 5, text: 'Draft BOQs and Technical Specifications' },
            { id: 6, text: 'Client Comments and Approvals on Detailed Design' },
            { id: 7, text: 'Finalization of Detailed Design' },
        ],
    },
    {
        id: 6,
        phase: 'Construction Design and Tender Finalization Stage',
        tasks: [
            { id: 1, text: 'Construction Design and Final Tender Preparation' },
            { id: 2, text: 'Architectural Construction Drawings' },
            { id: 3, text: 'Engineering Construction Drawings' },
            { id: 4, text: 'Final Tender Documents' },
            { id: 5, text: 'Client Comments / Approval on Final Tender Documents' },
            { id: 6, text: 'Tender Documents Ready for Issue' },
        ],
    },
    {
        id: 7,
        phase: 'Interior Design Development Stage',
        tasks: [
            { id: 1, text: 'Final Interior Design Development' },
            { id: 2, text: 'Interior Layout Working Details' },
            { id: 3, text: 'Interior Thematic Mood Board and Color Scheme' },
            { id: 4, text: 'Ceiling Detail Design Drawings' },
            { id: 5, text: 'Built-in Feature Details' },
            { id: 6, text: 'Partition and Pattern Detail Drawings' },
            { id: 7, text: 'Draft Interior Design Tender' },
            { id: 8, text: 'Client Comments / Approval on Interior Design Development' },
            { id: 9, text: 'Client Comments / Approval on Interior Design Tender' },
            { id: 10, text: 'Finalization of Interior Design Tender' },
        ],
    },
    {
        id: 8,
        phase: 'Procurement & Appointment Stage',
        tasks: [
            { id: 1, text: 'Procurement of Main Contractor' },
            { id: 2, text: 'Contract Award / Mobilization' },
        ],
    },
].map(p => ({ ...p, title: p.phase })));


export default function TimelinePage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    const [timelineData, setTimelineData] = useState<Phase[]>(initialTimelineData);

    const handlePhaseChange = (id: number, newTitle: string) => {
        setTimelineData(timelineData.map(p => p.id === id ? { ...p, title: newTitle } : p));
    };

    const handleTaskChange = (phaseId: number, taskId: number, newText: string) => {
        setTimelineData(timelineData.map(p => p.id === phaseId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, text: newText } : t) } : p));
    };

    const addPhase = () => {
        const newPhase: Phase = { id: Date.now(), title: 'New Phase', tasks: [{ id: Date.now(), text: 'New Task' }] };
        setTimelineData([...timelineData, newPhase]);
    };

    const removePhase = (id: number) => {
        setTimelineData(timelineData.filter(p => p.id !== id));
    };

    const addTask = (phaseId: number) => {
        setTimelineData(timelineData.map(p => p.id === phaseId ? { ...p, tasks: [...p.tasks, { id: Date.now(), text: 'New Task' }] } : p));
    };

    const removeTask = (phaseId: number, taskId: number) => {
        setTimelineData(timelineData.map(p => p.id === phaseId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
    };
    
    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = timelineData.map(phase => ({
            category: phase.title,
            items: phase.tasks.map(task => task.text),
        }));

        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Timeline Schedule',
                projectName: 'Timeline Schedule',
                data: dataToSave,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Record Saved', description: 'The timeline schedule has been saved.' });
        } catch (error) {
            console.error("Error saving document: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the record.' });
        }
    };
    
    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Architectural Project Timeline', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        timelineData.forEach((phase, index) => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${phase.title}`, 14, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            phase.tasks.forEach(task => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`- ${task.text}`, 20, yPos);
                yPos += 6;
            });
            yPos += 5;
        });

        doc.save('timeline-schedule.pdf');
        toast({ title: 'Download Started', description: 'Your timeline PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl md:text-4xl font-headline text-primary text-center">
                    Architectural Project Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {timelineData.map((phase, index) => (
                    <Card key={phase.id} className="p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg font-bold text-primary">{index + 1}.</span>
                            <Input 
                                value={phase.title}
                                onChange={(e) => handlePhaseChange(phase.id, e.target.value)}
                                className="text-lg font-bold border-0 bg-transparent focus-visible:ring-1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removePhase(phase.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                        <div className="space-y-2 pl-6">
                            {phase.tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-2">
                                    <Textarea
                                        value={task.text}
                                        onChange={(e) => handleTaskChange(phase.id, task.id, e.target.value)}
                                        className="flex-grow"
                                        rows={1}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeTask(phase.id, task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                             <Button variant="outline" size="sm" onClick={() => addTask(phase.id)}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                        </div>
                    </Card>
                ))}

                <Button onClick={addPhase}><PlusCircle className="mr-2 h-4 w-4" /> Add Phase</Button>
                
                 <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                    <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </CardContent>
        </Card>
    );
}
