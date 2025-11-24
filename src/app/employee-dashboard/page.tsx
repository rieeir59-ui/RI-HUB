
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCurrentUser } from '@/context/UserContext';
import { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, query, where, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  id: string;
  projectName: string;
  taskName: string;
  taskDescription: string;
  status: 'completed' | 'in-progress' | 'not-started';
  dueDate: string;
  assignedBy: string;
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
  const { user, isUserLoading } = useCurrentUser();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!firestore || !user) {
        setIsLoadingTasks(false);
        return;
    }

    setIsLoadingTasks(true);
    const tasksCollection = collection(firestore, 'tasks');
    const q = query(
        tasksCollection, 
        where('assignedTo', '==', user.record)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                projectName: data.projectName || '',
                taskName: data.taskName || '',
                taskDescription: data.taskDescription || '',
                status: data.status || 'not-started',
                dueDate: data.dueDate || '',
                assignedBy: data.assignedBy || 'N/A'
            } as Project
        });
        setProjects(fetchedTasks);
        setIsLoadingTasks(false);
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        const permissionError = new FirestorePermissionError({
            path: `tasks`,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch assigned tasks.",
        });
        setIsLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [firestore, user, isUserLoading, toast]);
  
  const handleStatusChange = async (taskId: string, newStatus: Project['status']) => {
    if (!firestore) return;

    const taskRef = doc(firestore, 'tasks', taskId);
    try {
      await updateDoc(taskRef, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`,
      });
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: `tasks/${taskId}`,
        operation: 'update',
        requestResourceData: { status: newStatus }
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };
  
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4">Loading user data...</span>
      </div>
    );
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
      
      <Card>
        <CardHeader>
            <CardTitle>My Assigned Tasks</CardTitle>
            <CardDescription>A list of tasks assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingTasks ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">Loading tasks...</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Assigned By</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length === 0 ? (
                           <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">You have no assigned tasks.</TableCell>
                           </TableRow>
                        ) : projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.projectName}</TableCell>
                                <TableCell>{project.taskName}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{project.taskDescription}</TableCell>
                                <TableCell>{project.dueDate}</TableCell>
                                <TableCell>{project.assignedBy}</TableCell>
                                <TableCell>
                                     <Select
                                        value={project.status}
                                        onValueChange={(newStatus: Project['status']) => handleStatusChange(project.id, newStatus)}
                                      >
                                        <SelectTrigger className="w-[180px]">
                                           <div className="flex items-center gap-2">
                                             <StatusIcon status={project.status} />
                                             <SelectValue placeholder="Set status" />
                                           </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="not-started">
                                             <div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Not Started</div>
                                          </SelectItem>
                                          <SelectItem value="in-progress">
                                            <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" />In Progress</div>
                                          </SelectItem>
                                          <SelectItem value="completed">
                                            <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Completed</div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
