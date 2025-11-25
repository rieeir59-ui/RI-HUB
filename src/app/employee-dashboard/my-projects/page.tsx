
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Clock, XCircle, Briefcase, PlusCircle, Trash2, Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/context/UserContext';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import { Suspense } from 'react';

const departments: Record<string, string> = {
    'ceo': 'CEO',
    'admin': 'Admin',
    'hr': 'HR',
    'software-engineer': 'Software Engineer',
    'draftman': 'Draftsman',
    '3d-visualizer': '3D Visualizer',
    'architects': 'Architects',
    'finance': 'Finance',
    'quantity-management': 'Quantity Management',
};

function formatDepartmentName(slug: string) {
    return departments[slug] || slug;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
}

type ProjectStatus = 'completed' | 'in-progress' | 'not-started';

type ProjectRow = {
  id: number;
  projectName: string;
  detail: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

const StatusIcon = ({ status }: { status: ProjectStatus }) => {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'in-progress':
            return <Clock className="h-5 w-5 text-blue-500" />;
        case 'not-started':
            return <XCircle className="h-5 w-5 text-red-500" />;
        default:
            return null;
    }
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

function MyProjectsComponent() {
    const { user: currentUser } = useCurrentUser();
    const { employees } = useEmployees();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore } = useFirebase();

    const employeeId = searchParams.get('employeeId');
    const displayUser = useMemo(() => {
        return employeeId ? employees.find(e => e.record === employeeId) : currentUser;
    }, [employeeId, employees, currentUser]);
    
    const isOwner = currentUser && displayUser && currentUser.record === displayUser.record;

    const [rows, setRows] = useState<ProjectRow[]>([{ id: 1, projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
    const [schedule, setSchedule] = useState({ start: '', end: '' });
    const [remarks, setRemarks] = useState('');

    const projectStats = useMemo(() => {
        const total = rows.length;
        const completed = rows.filter(p => p.status === 'completed').length;
        const inProgress = rows.filter(p => p.status === 'in-progress').length;
        const notStarted = rows.filter(p => p.status === 'not-started').length;
        return { total, completed, inProgress, notStarted };
    }, [rows]);
    
    const handleRowChange = (id: number, field: keyof ProjectRow, value: any) => {
        setRows(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), projectName: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
    };

    const removeRow = (id: number) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleSave = () => {
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }

        const dataToSave = {
            employeeId: currentUser.record,
            employeeName: currentUser.name,
            fileName: "My Projects",
            projectName: `Projects for ${currentUser.name}`,
            data: {
                category: 'My Projects',
                schedule,
                projects: rows,
                remarks,
            },
            createdAt: serverTimestamp(),
        };

        addDoc(collection(firestore, 'savedRecords'), dataToSave)
            .then(() => toast({ title: 'Record Saved', description: "Your project records have been saved." }))
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: `savedRecords`,
                    operation: 'create',
                    requestResourceData: dataToSave,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const footerText = "M/S Isbah Hassan & Associates Y-101 (Com), Phase-III, DHA Lahore Cantt 0321-6995378, 042-35692522";

        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Project Overview for ${displayUser?.name || 'Employee'}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        (doc as any).autoTable({
            startY: yPos, theme: 'plain', body: [
                [`Work Schedule Start: ${schedule.start || 'N/A'}`, `Work Schedule End: ${schedule.end || 'N/A'}`]
            ]
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
        
        (doc as any).autoTable({
            head: [['Project Name', 'Detail', 'Status', 'Start Date', 'End Date']],
            body: rows.map(row => [row.projectName, row.detail, row.status, row.startDate, row.endDate]),
            startY: yPos, theme: 'grid'
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Remarks:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(doc.splitTextToSize(remarks, doc.internal.pageSize.width - 28), 14, yPos);
        
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`${displayUser?.name}_projects.pdf`);
        toast({ title: 'Download Started', description: 'Your project PDF is being generated.' });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-primary">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-2xl">{displayUser ? getInitials(displayUser.name) : ''}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl font-bold">{displayUser?.name.toUpperCase()}</CardTitle>
                        <p className="text-muted-foreground">{displayUser ? formatDepartmentName(displayUser.department) : ''}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="font-semibold">Work Schedule</Label>
                        <div className="flex gap-4">
                            <Input type="date" value={schedule.start} onChange={e => setSchedule({ ...schedule, start: e.target.value })} disabled={!isOwner} />
                            <Input type="date" value={schedule.end} onChange={e => setSchedule({ ...schedule, end: e.target.value })} disabled={!isOwner} />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Detail</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    {isOwner && <TableHead>Action</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell><Input value={row.projectName} onChange={e => handleRowChange(row.id, 'projectName', e.target.value)} disabled={!isOwner} /></TableCell>
                                        <TableCell><Textarea value={row.detail} onChange={e => handleRowChange(row.id, 'detail', e.target.value)} rows={1} disabled={!isOwner} /></TableCell>
                                        <TableCell>
                                            <Select value={row.status} onValueChange={(val: ProjectStatus) => handleRowChange(row.id, 'status', val)} disabled={!isOwner}>
                                                <SelectTrigger className="w-[180px]">
                                                   <div className="flex items-center gap-2">
                                                     <StatusIcon status={row.status} />
                                                     <SelectValue placeholder="Set status" />
                                                   </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="not-started"><div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Not Started</div></SelectItem>
                                                  <SelectItem value="in-progress"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" />In Progress</div></SelectItem>
                                                  <SelectItem value="completed"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Completed</div></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell><Input type="date" value={row.startDate} onChange={e => handleRowChange(row.id, 'startDate', e.target.value)} disabled={!isOwner} /></TableCell>
                                        <TableCell><Input type="date" value={row.endDate} onChange={e => handleRowChange(row.id, 'endDate', e.target.value)} disabled={!isOwner} /></TableCell>
                                        {isOwner && <TableCell><Button variant="destructive" size="icon" onClick={() => removeRow(row.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {isOwner && <Button onClick={addRow} size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Project</Button>}

                    <div className="space-y-2 pt-4">
                        <Label htmlFor="remarks" className="font-semibold">Remarks</Label>
                        <Textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} disabled={!isOwner} />
                    </div>
                    
                    <div className="flex justify-end gap-4 mt-8">
                        {isOwner && <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4"/>Save Record</Button>}
                        <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Download PDF</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function MyProjectsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MyProjectsComponent />
        </Suspense>
    )
}
