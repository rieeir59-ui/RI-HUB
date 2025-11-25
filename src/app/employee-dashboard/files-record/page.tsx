'use client';

import { useEffect, useState } from 'react';
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, updateDoc, type Timestamp, FirestoreError } from 'firebase/firestore';
import { useCurrentUser } from '@/context/UserContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UploadedFile = {
    id: string;
    category: string;
    bankName?: string;
    customName: string;
    originalName: string;
    fileType: string;
    size: number;
    createdAt: Timestamp;
    employeeName: string;
};

const categories = ["Banks", "Residential", "Commercial", "Hotels"];

export default function FilesRecordPage() {
  const image = PlaceHolderImages.find(p => p.id === 'files-record');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser, isUserLoading } = useCurrentUser();

  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [fileToEdit, setFileToEdit] = useState<UploadedFile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    if (!firestore || !currentUser) {
        setIsLoading(false);
        setError("You must be logged in to view your files.");
        return;
    }
    
    const q = query(
        collection(firestore, "uploadedFiles"), 
        where("employeeId", "==", currentUser.record),
        orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupedFiles: Record<string, UploadedFile[]> = {};
      categories.forEach(cat => groupedFiles[cat] = []);

      snapshot.forEach((doc) => {
        const file = { id: doc.id, ...doc.data() } as UploadedFile;
        if (groupedFiles[file.category]) {
          groupedFiles[file.category].push(file);
        }
      });
      setFiles(groupedFiles);
      setIsLoading(false);
    }, (err: FirestoreError) => {
      setError("Failed to fetch your files. You may not have permission.");
      console.error(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, currentUser, isUserLoading]);
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const openDeleteDialog = (file: UploadedFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!fileToDelete || !firestore) return;
    try {
        await deleteDoc(doc(firestore, 'uploadedFiles', fileToDelete.id));
        toast({ title: 'Success', description: `File "${fileToDelete.customName}" deleted.` });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete file.' });
    } finally {
        setIsDeleteDialogOpen(false);
    }
  };
  
  const openEditDialog = (file: UploadedFile) => {
    setFileToEdit(file);
    setNewFileName(file.customName);
    setIsEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!fileToEdit || !newFileName || !firestore) return;
    try {
      await updateDoc(doc(firestore, 'uploadedFiles', fileToEdit.id), {
        customName: newFileName
      });
      toast({ title: 'Success', description: 'File name updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update file name.' });
    } finally {
      setIsEditDialogOpen(false);
    }
  };

  const hasAnyFiles = Object.values(files).some(arr => arr.length > 0);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Your Files Record"
        description="View and manage your uploaded project files."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : error ? (
        <Card className="text-center py-8"><CardContent><p className="text-destructive">{error}</p></CardContent></Card>
      ) : !hasAnyFiles ? (
         <Card className="text-center py-12">
            <CardHeader>
                <CardTitle>No Files Found</CardTitle>
                <CardDescription>You have not uploaded any files yet.</CardDescription>
            </CardHeader>
        </Card>
      ) : (
        categories.map(category => (
            files[category]?.length > 0 && (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category} Files</CardTitle>
                        <CardDescription>Documents you uploaded under the {category.toLowerCase()} category.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left">
                                    <tr className="border-b">
                                        <th className="p-2">File Name</th>
                                        {category === 'Banks' && <th className="p-2">Bank</th>}
                                        <th className="p-2">Original Name</th>
                                        <th className="p-2">Size</th>
                                        <th className="p-2">Date</th>
                                        <th className="p-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files[category].map(file => (
                                        <tr key={file.id} className="border-b">
                                            <td className="p-2 font-medium">{file.customName}</td>
                                            {category === 'Banks' && <td className="p-2">{file.bankName || 'N/A'}</td>}
                                            <td className="p-2 text-muted-foreground">{file.originalName}</td>
                                            <td className="p-2">{formatBytes(file.size)}</td>
                                            <td className="p-2">{file.createdAt.toDate().toLocaleDateString()}</td>
                                            <td className="p-2 flex gap-1 justify-end">
                                                <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(file)}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(file)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )
        ))
      )}
      
      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file "{fileToDelete?.customName}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit File Name</DialogTitle>
                <DialogDescription>
                    Change the custom name for "{fileToEdit?.originalName}".
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
                <Label htmlFor="edit-name">Custom File Name</Label>
                <Input id="edit-name" value={newFileName} onChange={e => setNewFileName(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmEdit}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
