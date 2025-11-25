'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, PlusCircle, Trash2, ImageUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';

interface Personnel {
  id: number;
  name: string;
  designation: string;
}

interface Picture {
  id: number;
  file: File | null;
  previewUrl: string;
  description: string;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function SiteSurveyReportPage() {
    const { toast } = useToast();
    const [bankName, setBankName] = useState('HABIB BANK LIMITED');
    const [branchName, setBranchName] = useState('EXPO CENTER BRANCH, LAHORE');
    const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [surveyDate, setSurveyDate] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
    const [personnel, setPersonnel] = useState<Personnel[]>([
        { id: 1, name: 'Mr. Raja Waseem', designation: 'Assistant Architect - KS & Associates' },
        { id: 2, name: 'Mr. Muhammad Awais', designation: 'Engineer – KS & Associates' }
    ]);
    const [observations, setObservations] = useState(
        'Our team surveyed the existing HBL- Expo Center Lahore branch on 03rd April 2025. The building was documented through photographs. The information collected is summarized in the following pictorial report.'
    );
    const [pictures, setPictures] = useState<Picture[]>([]);

    const addPersonnel = () => {
        setPersonnel([...personnel, { id: Date.now(), name: '', designation: '' }]);
    };
    const removePersonnel = (id: number) => {
        setPersonnel(personnel.filter(p => p.id !== id));
    };
    const handlePersonnelChange = (id: number, field: 'name' | 'designation', value: string) => {
        setPersonnel(personnel.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    
    const addPicture = () => {
        setPictures([...pictures, { id: Date.now(), file: null, previewUrl: '', description: '' }]);
    };
    const removePicture = (id: number) => {
        setPictures(pictures.filter(p => p.id !== id));
    };
    const handlePictureFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setPictures(pictures.map(p => p.id === id ? { ...p, file, previewUrl } : p));
        }
    };
     const handlePictureDescChange = (id: number, value: string) => {
        setPictures(pictures.map(p => p.id === id ? { ...p, description: value } : p));
    };


    const handleSave = () => {
        toast({ title: "Record Saved", description: "The site survey report has been saved." });
    };

    const handleDownload = async () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(bankName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.text(branchName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 12;

        doc.setFontSize(14);
        doc.text('Site Survey Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(12);
        doc.text(reportDate, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('SITE SURVEY DATE:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${surveyDate}`, margin + 5, yPos);
        yPos += 12;

        doc.setFont('helvetica', 'bold');
        doc.text('PERSONNEL PRESENT DURING SITE VISIT:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        personnel.forEach(p => {
            doc.text(`• ${p.name}`, margin + 5, yPos);
            doc.text(`(${p.designation})`, margin + 80, yPos);
            yPos += 7;
        });
        yPos += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVATIONS AND REMARKS BY KS & ASSOCIATES:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const obsLines = doc.splitTextToSize(observations, pageWidth - (margin * 2));
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 10;
        
        for (const pic of pictures) {
            if (pic.previewUrl) {
                 if (yPos > 180) { // Check if space is enough for image + text
                    doc.addPage();
                    yPos = 20;
                }
                const img = new (window as any).Image();
                img.src = pic.previewUrl;
                await new Promise(resolve => img.onload = resolve);
                
                const imgWidth = 120;
                const imgHeight = (img.height * imgWidth) / img.width;
                const x = (pageWidth - imgWidth) / 2;
                doc.addImage(img, 'JPEG', x, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 5;
                
                doc.setFontSize(10);
                doc.text(pic.description, pageWidth / 2, yPos, { align: 'center', maxWidth: 160 });
                yPos += doc.splitTextToSize(pic.description, 160).length * 5 + 10;
            }
        }

        doc.save('Site_Survey_Report.pdf');
        toast({ title: "Download Started", description: "Your Site Survey Report is being generated." });
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle className="text-center font-headline text-3xl text-primary">Site Survey Report</CardTitle>
            </CardHeader>
            <CardContent className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <Input className="text-2xl font-bold text-center border-0 focus-visible:ring-1" value={bankName} onChange={e => setBankName(e.target.value)} />
                    <Input className="text-xl text-center border-0 focus-visible:ring-1" value={branchName} onChange={e => setBranchName(e.target.value)} />
                    <Input className="text-lg text-muted-foreground text-center border-0 focus-visible:ring-1" value={reportDate} onChange={e => setReportDate(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label className="font-bold text-lg">SITE SURVEY DATE:</Label>
                    <Input value={surveyDate} onChange={e => setSurveyDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label className="font-bold text-lg">PERSONNEL PRESENT DURING SITE VISIT:</Label>
                    {personnel.map(p => (
                        <div key={p.id} className="flex items-center gap-2">
                            <Input placeholder="Name" value={p.name} onChange={e => handlePersonnelChange(p.id, 'name', e.target.value)} className="flex-1" />
                            <Input placeholder="Designation" value={p.designation} onChange={e => handlePersonnelChange(p.id, 'designation', e.target.value)} className="flex-1" />
                            <Button variant="ghost" size="icon" onClick={() => removePersonnel(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPersonnel}><PlusCircle className="mr-2 h-4 w-4" />Add Personnel</Button>
                </div>
                
                <div className="space-y-2">
                    <Label className="font-bold text-lg">OBSERVATIONS AND REMARKS:</Label>
                    <Textarea value={observations} onChange={e => setObservations(e.target.value)} rows={5} />
                </div>

                <div className="space-y-4">
                    <Label className="font-bold text-lg">Pictorial Report</Label>
                    {pictures.map((pic, index) => (
                        <Card key={pic.id} className="p-4">
                            <div className="flex flex-col gap-4">
                                <Label htmlFor={`pic-upload-${pic.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                    {pic.previewUrl ? (
                                        <Image src={pic.previewUrl} alt={`Preview ${index + 1}`} width={100} height={100} className="h-full w-auto object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageUp className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">JPG, PNG</p>
                                        </div>
                                    )}
                                    <Input id={`pic-upload-${pic.id}`} type="file" accept="image/jpeg, image/png" className="hidden" onChange={e => handlePictureFileChange(pic.id, e)} />
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Textarea placeholder={`Description for picture ${index + 1}...`} value={pic.description} onChange={e => handlePictureDescChange(pic.id, e.target.value)} rows={2} />
                                  <Button variant="destructive" size="icon" onClick={() => removePicture(pic.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" onClick={addPicture}><PlusCircle className="mr-2 h-4 w-4" />Add Image</Button>
                </div>

                <div className="flex justify-end gap-4 pt-8">
                    <Button onClick={handleSave} variant="outline"><Save className="mr-2 h-4 w-4" />Save</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                </div>
            </CardContent>
        </Card>
    );
}
