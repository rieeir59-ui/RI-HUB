
'use client';

import DashboardPageHeader from "@/components/dashboard/PageHeader";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

const sampleFiles = [
    { name: 'project-blueprint.pdf', type: 'PDF', size: '2.5 MB', date: '2023-10-26' },
    { name: 'site-photo-1.jpg', type: 'JPG', size: '4.1 MB', date: '2023-10-25' },
    { name: 'material-specifications.docx', type: 'DOCX', size: '1.2 MB', date: '2023-10-24' },
]

export default function FilesRecordPage() {
  const image = PlaceHolderImages.find(p => p.id === 'files-record');

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Files Record"
        description="View and manage all uploaded project files."
        imageUrl={image?.imageUrl || ''}
        imageHint={image?.imageHint || ''}
      />
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>A list of all documents and files uploaded for the projects.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sampleFiles.map(file => (
                        <TableRow key={file.name}>
                            <TableCell className="font-medium">{file.name}</TableCell>
                            <TableCell>{file.type}</TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>{file.date}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
