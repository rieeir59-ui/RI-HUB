'use client';

import { useState } from "react";
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp, PlusCircle, Trash2 } from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { useCurrentUser } from "@/context/UserContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FileUpload = {
  id: number;
  file: File | null;
  customName: string;
  category: string;
  bankName?: string;
};

const categories = ["Banks", "Residential", "Commercial", "Hotels"];
const banks = ["MCB", "DIB", "FAYSAL", "UBL", "HBL"];

export default function UploadFilesPage() {
  const image = PlaceHolderImages.find(p => p.id === 'upload-files');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [uploads, setUploads] = useState<FileUpload[]>([{ id: 1, file: null, customName: '', category: '' }]);

  const handleFileChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setUploads(prev => prev.map(up => up.id === id ? { ...up, file } : up));
    }
  };
  
  const handleFieldChange = (id: number, field: keyof FileUpload, value: string) => {
    setUploads(prev => prev.map(up => {
      if (up.id === id) {
        const updatedUpload = { ...up, [field]: value };
        // Reset bankName if category is not Banks
        if (field === 'category' && value !== 'Banks') {
          updatedUpload.bankName = '';
        }
        return updatedUpload;
      }
      return up;
    }));
  };

  const addFileUpload = () => {
    setUploads(prev => [...prev, { id: Date.now(), file: null, customName: '', category: '' }]);
  };
  
  const removeFileUpload = (id: number) => {
    setUploads(prev => prev.filter(up => up.id !== id));
  };
  
  const handleUpload = (upload: FileUpload) => {
    if (!upload.file || !upload.customName || !upload.category) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a category, provide a custom name, and choose a file.',
      });
      return;
    }
    
    if (upload.category === 'Banks' && !upload.bankName) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select a bank name for the Banks category.',
        });
        return;
    }

    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }

    console.log(`Uploading: ${upload.file.name} as ${upload.customName} to ${upload.category}`);

    const recordData: any = {
        employeeId: currentUser.record,
        employeeName: currentUser.name,
        fileName: 'Uploaded File',
        category: upload.category,
        customName: upload.customName,
        originalName: upload.file.name,
        fileType: upload.file.type,
        size: upload.file.size,
        createdAt: serverTimestamp(),
    };

    if (upload.category === 'Banks' && upload.bankName) {
        recordData.bankName = upload.bankName;
    }

    addDoc(collection(firestore, 'uploadedFiles'), recordData)
        .then(() => {
            toast({
              title: 'File Uploaded',
              description: `"${upload.customName}" has been successfully uploaded.`,
            });
            // Remove the uploaded row
            removeFileUpload(upload.id);
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: 'uploadedFiles',
                operation: 'create',
                requestResourceData: recordData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Upload Files"
        description="Upload project documents, images, or other files."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
       <Card>
        <CardHeader>
            <CardTitle>File Uploader</CardTitle>
            <CardDescription>Select a category, name your file, and upload it to the project records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {uploads.map((upload, index) => (
                <div key={upload.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4 p-4 border rounded-lg relative">
                   <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFileUpload(upload.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    <div className="space-y-2">
                        <Label htmlFor={`category-${upload.id}`}>Category</Label>
                        <Select value={upload.category} onValueChange={(value) => handleFieldChange(upload.id, 'category', value)}>
                            <SelectTrigger id={`category-${upload.id}`}>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {upload.category === 'Banks' && (
                         <div className="space-y-2">
                            <Label htmlFor={`bank-${upload.id}`}>Bank Name</Label>
                            <Select value={upload.bankName} onValueChange={(value) => handleFieldChange(upload.id, 'bankName', value)}>
                                <SelectTrigger id={`bank-${upload.id}`}>
                                    <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.map(bank => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor={`name-${upload.id}`}>File Name</Label>
                        <Input id={`name-${upload.id}`} placeholder="Enter a custom name" value={upload.customName} onChange={e => handleFieldChange(upload.id, 'customName', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor={`file-${upload.id}`}>Select File</Label>
                        <Input id={`file-${upload.id}`} type="file" onChange={(e) => handleFileChange(upload.id, e)} />
                    </div>

                    <Button onClick={() => handleUpload(upload)} className="w-full lg:w-auto">
                        <FileUp className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </div>
             ))}
             <Button variant="outline" onClick={addFileUpload}>
                <PlusCircle className="mr-2 h-4 w-4" />Add Another File
            </Button>
        </CardContent>
       </Card>
    </div>
  );
}
