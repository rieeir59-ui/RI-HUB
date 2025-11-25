'use client';

import { useState } from "react";
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp, PlusCircle } from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { useCurrentUser } from "@/context/UserContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FileUpload = {
  id: number;
  file: File | null;
  customName: string;
};

const categories = ["Banks", "Residential", "Commercial", "Hotels"];

export default function UploadFilesPage() {
  const image = PlaceHolderImages.find(p => p.id === 'upload-files');
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: currentUser } = useCurrentUser();

  const [uploads, setUploads] = useState<Record<string, FileUpload[]>>({
    Banks: [{ id: 1, file: null, customName: '' }],
    Residential: [{ id: 1, file: null, customName: '' }],
    Commercial: [{ id: 1, file: null, customName: '' }],
    Hotels: [{ id: 1, file: null, customName: '' }],
  });

  const handleFileChange = (category: string, id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setUploads(prev => ({
        ...prev,
        [category]: prev[category].map(up => up.id === id ? { ...up, file } : up)
      }));
    }
  };
  
  const handleNameChange = (category: string, id: number, value: string) => {
    setUploads(prev => ({
      ...prev,
      [category]: prev[category].map(up => up.id === id ? { ...up, customName: value } : up)
    }));
  };

  const addFileUpload = (category: string) => {
    setUploads(prev => ({
        ...prev,
        [category]: [...prev[category], { id: Date.now(), file: null, customName: '' }]
    }));
  };
  
  const handleUpload = (category: string, upload: FileUpload) => {
    if (!upload.file || !upload.customName) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a file and provide a custom name.',
      });
      return;
    }
    
    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }

    // In a real app, you would upload to Firebase Storage first and get a URL.
    // For now, we simulate this and save metadata to Firestore.
    console.log(`Uploading: ${upload.file.name} as ${upload.customName} to ${category}`);

    const recordData = {
        employeeId: currentUser.record,
        employeeName: currentUser.name,
        fileName: 'Uploaded File',
        category: category,
        customName: upload.customName,
        originalName: upload.file.name,
        fileType: upload.file.type,
        size: upload.file.size,
        // fileUrl: 'https://placeholder.url/from/firebase/storage',
        createdAt: serverTimestamp(),
    };

    addDoc(collection(firestore, 'uploadedFiles'), recordData)
        .then(() => {
            toast({
              title: 'File Uploaded',
              description: `"${upload.customName}" has been successfully uploaded.`,
            });
            // Reset the specific upload row after success
            setUploads(prev => ({
                ...prev,
                [category]: prev[category].filter(u => u.id !== upload.id)
            }));
            if(uploads[category].length === 1) { // if it was the last one
                addFileUpload(category);
            }
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
        <CardContent>
            <Tabs defaultValue="Banks" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {categories.map(cat => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
                </TabsList>
                {categories.map(cat => (
                    <TabsContent key={cat} value={cat}>
                        <div className="space-y-4 pt-4">
                             {uploads[cat].map((upload) => (
                                <div key={upload.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
                                    <div className="w-full sm:w-1/3">
                                        <Label htmlFor={`name-${cat}-${upload.id}`}>File Name</Label>
                                        <Input id={`name-${cat}-${upload.id}`} placeholder="Enter a custom name" value={upload.customName} onChange={e => handleNameChange(cat, upload.id, e.target.value)} />
                                    </div>
                                    <div className="w-full sm:w-1/3">
                                        <Label htmlFor={`file-${cat}-${upload.id}`}>Select File</Label>
                                        <Input id={`file-${cat}-${upload.id}`} type="file" onChange={(e) => handleFileChange(cat, upload.id, e)} />
                                         {upload.file && <p className="text-xs text-muted-foreground mt-1 truncate">{upload.file.name}</p>}
                                    </div>
                                    <div className="w-full sm:w-auto mt-4 sm:mt-0 self-end">
                                        <Button onClick={() => handleUpload(cat, upload)} className="w-full sm:w-auto">
                                            <FileUp className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                    </div>
                                </div>
                             ))}
                             <Button variant="outline" onClick={() => addFileUpload(cat)}>
                                <PlusCircle className="mr-2 h-4 w-4" />Add New File
                            </Button>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </CardContent>
       </Card>
    </div>
  );
}
