'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useFirebase } from '@/firebase/provider';
import { useCurrentUser } from '@/context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

interface Task {
  id: number;
  taskId: string;
  taskName: string;
  duration: string;
  start: string;
  finish: string;
  predecessor: string;
  isHeader: boolean;
}

const initialTasks: Task[] = [
    { id: 1, taskId: '1', taskName: 'Project Name:', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 2, taskId: '2', taskName: 'Conceptual Design', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 3, taskId: '3', taskName: 'Client Brief', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 4, taskId: '4', taskName: 'Topographic Survey', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 5, taskId: '5', taskName: 'Project Scope and Area Statements', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 6, taskId: '6', taskName: 'Conceptual Plans and Supporting Drawings', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 7, taskId: '7', taskName: 'Concept Engineering', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 8, taskId: '8', taskName: 'Geotechnical Investigation and Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 9, taskId: '9', taskName: 'Conceptual Interior Brief', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 10, taskId: '10', taskName: 'Finalize Concept Design / Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 11, taskId: '11', taskName: 'Client Comments / Approval on Concept Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 12, taskId: '12', taskName: 'Preliminary Design', duration: '', start: '', finish: '', predecessor: '', isHeader: true },
    { id: 13, taskId: '13', taskName: 'Layout Plans-Cycle 1', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 14, taskId: '14', taskName: 'Initial Engineering', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 15, taskId: '15', taskName: 'Preliminary Design Workshop', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 16, taskId: '16', taskName: 'Layout Plans-Cycle 2', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 17, taskId: '17', taskName: 'Environmental Study and Authority Approval', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 18, taskId: '18', taskName: '3-D Model', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 19, taskId: '19', taskName: 'External Elevation', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 20, taskId: '20', taskName: 'Building Section', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 21, taskId: '21', taskName: 'Preliminary Interior Layouts', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 22, taskId: '22', taskName: 'Preliminary Engineering Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 23, taskId: '23', taskName: 'Finalize Preliminary Design / Report', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
    { id: 24, taskId: '24', taskName: 'Client Comments / Approval on Preliminary Design', duration: '', start: '', finish: '', predecessor: '', isHeader: false },
];

export default function TimelinePage() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();
    
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [project, setProject] = useState('');
    const [architect, setArchitect] = useState('IH&SA');
    const [projectNo, setProjectNo] = useState('');
    const [projectDate, setProjectDate] = useState('');

    const handleTaskChange = (id: number, field: keyof Task, value: string) => {
        setTasks(tasks.map(t => (t.id === id ? { ...t, [field]: value } : t)));
    };

    const addTask = () => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTaskId = tasks.length > 0 ? String(parseInt(tasks[tasks.length - 1].taskId) + 1) : '1';
        const newTask: Task = { id: newId, taskId: newTaskId, taskName: '', duration: '', start: '', finish: '', predecessor: '', isHeader: false };
        setTasks([...tasks, newTask]);
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleSave = async () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            category: 'Timeline Schedule',
            items: tasks.map(task =>
                `ID: ${task.taskId}, Task: ${task.taskName}, Duration: ${task.duration}, Start: ${task.start}, Finish: ${task.finish}, Predecessor: ${task.predecessor}`
            ),
        };
        
        try {
            await addDoc(collection(firestore, 'savedRecords'), {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Timeline Schedule',
                projectName: project || 'Untitled Timeline',
                data: [dataToSave],
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

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TIME LINE SCHEDULE', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`Project: ${project}`, 14, yPos);
        doc.text(`Architect: ${architect}`, 120, yPos);
        yPos += 7;
        doc.text(`(Name, Address)`, 14, yPos);
        doc.text(`Architects Project No: ${projectNo}`, 120, yPos);
        yPos += 7;
        doc.text(`Project Date: ${projectDate}`, 120, yPos);
        yPos += 10;
        
        (doc as any).autoTable({
            head: [['ID', 'Task Name', 'Duration', 'Start', 'Finish', 'Predecessor']],
            body: tasks.map(t => [t.taskId, t.taskName, t.duration, t.start, t.finish, t.predecessor]),
            startY: yPos,
            didParseCell: function(data) {
                if (tasks[data.row.index]?.isHeader) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = '#f0f0f0';
                }
            }
        });

        doc.save('timeline-schedule.pdf');
        toast({ title: 'Download Started', description: 'Your timeline PDF is being generated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">TIME LINE SCHEDULE</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Label htmlFor="project">Project (Name, Address)</Label>
                        <Input id="project" value={project} onChange={e => setProject(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="architect">Architect</Label>
                        <Input id="architect" value={architect} onChange={e => setArchitect(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="projectNo">Architects Project No</Label>
                        <Input id="projectNo" value={projectNo} onChange={e => setProjectNo(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="projectDate">Project Date</Label>
                        <Input id="projectDate" type="date" value={projectDate} onChange={e => setProjectDate(e.target.value)} />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">ID</TableHead>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Predecessor</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map(task => (
                            <TableRow key={task.id} className={task.isHeader ? 'bg-muted' : ''}>
                                <TableCell>
                                    <Input value={task.taskId} onChange={e => handleTaskChange(task.id, 'taskId', e.target.value)} className="font-bold" />
                                </TableCell>
                                <TableCell>
                                    <Input value={task.taskName} onChange={e => handleTaskChange(task.id, 'taskName', e.target.value)} className={task.isHeader ? 'font-bold' : ''} />
                                </TableCell>
                                <TableCell><Input value={task.duration} onChange={e => handleTaskChange(task.id, 'duration', e.target.value)} /></TableCell>
                                <TableCell><Input type="date" value={task.start} onChange={e => handleTaskChange(task.id, 'start', e.target.value)} /></TableCell>
                                <TableCell><Input type="date" value={task.finish} onChange={e => handleTaskChange(task.id, 'finish', e.target.value)} /></TableCell>
                                <TableCell><Input value={task.predecessor} onChange={e => handleTaskChange(task.id, 'predecessor', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Button variant="destructive" size="icon" onClick={() => removeTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4">
                     <Button onClick={addTask}><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                    <div className="flex gap-4">
                        <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
                        <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
