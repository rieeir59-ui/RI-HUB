
'use client';

import { useState } from "react";
import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp, PlusCircle, Trash2, Building, Home, Hotel, Landmark } from "lucide-react";
import { useFirebase } from "@/firebase/provider";
import { useCurrentUser } from "@/context/UserContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";

type FileUpload = {
  id: number;
  file: File | null;
  customName: string;
  bankName?: string;
};

const categories = [
    { name: "Banks", icon: Landmark },
    { name: "Residential", icon: Home },
    { name: "Commercial", icon: Building },
    { name: "Hotels", icon: Hotel }
];
const banks = ["MCB", "DIB", "FAYSAL", "UBL", "HBL"];

const UploadForm = ({ category, onUploadSuccess }: { category: string, onUploadSuccess: (id: number) => void }) => {
    const [uploads, setUploads] = useState<FileUpload[]>([{ id: 1, file: null, customName: '', bankName: '' }]);
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const { user: currentUser } = useCurrentUser();

    const handleFileChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const file = event.target.files[0];
            setUploads(prev => prev.map(up => up.id === id ? { ...up, file } : up));
        }
    };

    const handleFieldChange = (id: number, field: keyof FileUpload, value: string) => {
        setUploads(prev => prev.map(up => (up.id === id ? { ...up, [field]: value } : up)));
    };

    const addFileUpload = () => {
        setUploads(prev => [...prev, { id: Date.now(), file: null, customName: '', bankName: '' }]);
    };

    const removeFileUpload = (id: number) => {
        setUploads(prev => prev.filter(up => up.id !== id));
    };

    const handleUpload = async (upload: FileUpload) => {
        if (!upload.file || !upload.customName) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a custom name and choose a file.' });
            return;
        }
        if (category === 'Banks' && !upload.bankName) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a bank name for the Banks category.' });
            return;
        }
        if (!firestore || !currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        
        toast({ title: 'Uploading...', description: `"${upload.customName}" is being uploaded.` });
        
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/${currentUser.record}/${Date.now()}-${upload.file.name}`);
        
        try {
            const snapshot = await uploadBytes(storageRef, upload.file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const recordData: any = {
                employeeId: currentUser.record,
                employeeName: currentUser.name,
                fileName: 'Uploaded File',
                category: category,
                customName: upload.customName,
                originalName: upload.file.name,
                fileType: upload.file.type,
                size: upload.file.size,
                fileUrl: downloadURL,
                createdAt: serverTimestamp(),
            };

            if (category === 'Banks' && upload.bankName) {
                recordData.bankName = upload.bankName;
            }

            await addDoc(collection(firestore, 'uploadedFiles'), recordData);

            toast({ title: 'File Uploaded', description: `"${upload.customName}" has been successfully uploaded.` });
            onUploadSuccess(upload.id);
            // Optionally clear the successful upload
            setUploads(prev => prev.filter(up => up.id !== upload.id));
            if (uploads.length === 1) {
              setUploads([{ id: 1, file: null, customName: '', bankName: '' }])
            }

        } catch (error: any) {
            console.error("Upload failed", error);
            if (error.code && error.code.includes('storage/unauthorized')) {
                 const permissionError = new FirestorePermissionError({
                    path: `uploads/${currentUser.record}/${upload.file.name}`,
                    operation: 'write',
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                 toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload file.' });
            }
        }
    };

    return (
        <div className="space-y-4 mt-4">
            {uploads.map((upload) => (
                <div key={upload.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end gap-4 p-4 border rounded-lg relative bg-muted/50">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFileUpload(upload.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    {category === 'Banks' && (
                        <div className="space-y-2">
                            <Label htmlFor={`bank-${upload.id}`}>Bank Name</Label>
                            <Select value={upload.bankName} onValueChange={(value) => handleFieldChange(upload.id, 'bankName', value)}>
                                <SelectTrigger id={`bank-${upload.id}`}><SelectValue placeholder="Select a bank" /></SelectTrigger>
                                <SelectContent>{banks.map(bank => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}</SelectContent>
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
        </div>
    );
};

export default function UploadFilesPage() {
    const image = PlaceHolderImages.find(p => p.id === 'upload-files');
    const [selectedCategory, setSelectedCategory] = useState<string>('Banks');

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
                    <CardTitle>Select a Category</CardTitle>
                    <CardDescription>Choose a category to upload files to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map(({ name, icon: Icon }) => (
                             <Card
                                key={name}
                                className={cn(
                                    "p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent hover:border-primary transition-all",
                                    selectedCategory === name ? "bg-accent border-primary ring-2 ring-primary" : ""
                                )}
                                onClick={() => setSelectedCategory(name)}
                            >
                                <Icon className="w-12 h-12 text-primary" />
                                <p className="font-semibold text-lg">{name}</p>
                            </Card>
                        ))}
                    </div>

                    {selectedCategory && (
                        <div className="mt-8">
                             <h2 className="text-2xl font-bold mb-4">Upload to {selectedCategory}</h2>
                             <UploadForm 
                                category={selectedCategory} 
                                onUploadSuccess={() => { /* Could add logic to refetch or update a list here */ }}
                             />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
