
'use client';

import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileUp } from "lucide-react";
import { useState } from "react";

export default function UploadFilesPage() {
  const image = PlaceHolderImages.find(p => p.id === 'upload-files');
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Here you would handle the file upload, e.g., to Firebase Storage
      console.log('Uploading:', selectedFile.name);
      toast({
        title: 'File Uploaded',
        description: `${selectedFile.name} has been successfully uploaded.`,
      });
      setSelectedFile(null); // Reset after upload
    } else {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to upload.',
      });
    }
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
          <CardDescription>Select a file and click upload to save it to the project records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input type="file" onChange={handleFileChange} />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>
            )}
            <Button onClick={handleUpload}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload File
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
