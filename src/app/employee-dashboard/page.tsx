'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCurrentUser } from '@/context/UserContext';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, PlusCircle, Trash2, Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const departments: Record<string, string> = {
    'ceo': 'CEO',
    'admin': 'Admin',
    'hr': 'HR',
    'software-engineer': 'Software Engineer',
    'draftman': 'Draftman',
    '3d-visualizer': '3D Visualizer',
    'architects': 'Architects',
    'finance': 'Finance',
    'quantity-management': 'Quantity Management',
};

function formatDepartmentName(slug: string) {
    return departments[slug] || slug;
}

interface Project {
  id: number;
  name: string;
  detail: string;
  status: 'completed' | 'in-progress' | 'not-started';
  startDate: string;
  endDate: string;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
}

const StatusIcon = ({ status }: { status: Project['status'] }) => {
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

export default function EmployeeDashboardPage() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: '', detail: '', status: 'not-started', startDate: '', endDate: '' }
  ]);
  const [schedule, setSchedule] = useState({ startDate: '', endDate: ''});
  const [remarks, setRemarks] = useState('');

  const handleProjectChange = (id: number, field: keyof Project, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProjectRow = () => {
    setProjects([...projects, { id: Date.now(), name: '', detail: '', status: 'not-started', startDate: '', endDate: '' }]);
  };

  const deleteProjectRow = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const projectStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const notStarted = projects.filter(p => p.status === 'not-started').length;
    return { total, completed, inProgress, notStarted };
  }, [projects]);
  
  const handleSave = () => {
    console.log({ schedule, projects, remarks });
    toast({ title: "Saved", description: "Your project schedule has been saved." });
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    let yPos = 20;

    if (user) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(user.name, 14, yPos);
        yPos += 10;
    }

    doc.setFontSize(12);
    doc.text(`Schedule: ${schedule.startDate} to ${schedule.endDate}`, 14, yPos);
    yPos += 15;

    doc.autoTable({
        head: [['Project Name', 'Detail', 'Status', 'Start Date', 'End Date']],
        body: projects.map(p => [p.name, p.detail, p.status, p.startDate, p.endDate]),
        startY: yPos,
        theme: 'grid'
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;
    
    doc.text('Remarks:', 14, yPos);
    yPos += 7;
    const remarksLines = doc.splitTextToSize(remarks, doc.internal.pageSize.width - 28);
    doc.text(remarksLines, 14, yPos);

    doc.save('my-projects.pdf');
    toast({ title: "Downloaded", description: "Your project schedule has been downloaded as a PDF." });
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card/90 border-primary/30 shadow-lg">
        <CardHeader className="text-center">
          {user && (
            <>
              <CardTitle className="text-4xl font-headline text-primary font-bold">{user.name}</CardTitle>
              <CardDescription className="text-xl text-primary/90 font-semibold pt-1">Welcome to {formatDepartmentName(user.department)} Panel</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Use the sidebar to navigate to different sections of your dashboard.</p>
        </CardContent>
      </Card>
      
      {/* My Projects Section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            {user && (
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-4 border-primary shadow-inner">
                        <span className="text-4xl font-bold text-primary">{getInitials(user.name)}</span>
                    </div>
                    <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                </div>
            )}
            <div className="flex items-center gap-6 text-sm">
                <div className="font-semibold">Total Projects: {projectStats.total}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Completed: {projectStats.completed}</div>
                <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" /> In Progress: {projectStats.inProgress}</div>
                <div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> Not Started: {projectStats.notStarted}</div>
            </div>
             <div className="flex items-center gap-4">
                <Label>Work Schedule:</Label>
                <Input type="date" value={schedule.startDate} onChange={(e) => setSchedule({...schedule, startDate: e.target.value})} className="w-fit" />
                <span>to</span>
                <Input type="date" value={schedule.endDate} onChange={(e) => setSchedule({...schedule, endDate: e.target.value})} className="w-fit" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Detail</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Tick</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell><Input value={project.name} onChange={(e) => handleProjectChange(project.id, 'name', e.target.value)} /></TableCell>
                            <TableCell><Input value={project.detail} onChange={(e) => handleProjectChange(project.id, 'detail', e.target.value)} /></TableCell>
                            <TableCell>
                                <Select value={project.status} onValueChange={(value) => handleProjectChange(project.id, 'status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="not-started">Not Started</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell><Input type="date" value={project.startDate} onChange={(e) => handleProjectChange(project.id, 'startDate', e.target.value)} /></TableCell>
                            <TableCell><Input type="date" value={project.endDate} onChange={(e) => handleProjectChange(project.id, 'endDate', e.target.value)} /></TableCell>
                            <TableCell><StatusIcon status={project.status} /></TableCell>
                            <TableCell>
                                <Button variant="destructive" size="icon" onClick={() => deleteProjectRow(project.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button onClick={addProjectRow} size="sm" className="mt-4"><PlusCircle className="mr-2 h-4 w-4"/>Add Project</Button>

            <div className="mt-6">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" />Save</Button>
                <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
