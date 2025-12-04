"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UploadDropzone } from "../../../../../components/upload-dropzone";
import { FileIcon, Eye, Loader2 } from "lucide-react";
import { useMedicalFiles, MedicalFile } from "../../../../../hooks/use-medical-files"; 
import { Button } from "../../../../../components/ui/button";
import { DicomViewer } from "../../../../../components/dicom-viewer";

export default function PatientFilesPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: files, refetch, isLoading } = useMedicalFiles(id);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const handleView = async (file: MedicalFile) => {
    setLoadingFileId(file.id);
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/sign-download`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ fileKey: file.s3Key })
        });
        if (!res.ok) throw new Error("Failed to get download URL");
        const data = await res.json();
        setViewingUrl(data.downloadUrl);
    } catch (e) {
        console.error(e);
        alert("Errore apertura file");
    } finally {
        setLoadingFileId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Documentazione Clinica</h2>
      </div>

      {/* Area Upload */}
      <UploadDropzone patientId={id} onUploadComplete={() => refetch()} />

      {/* Lista File */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {isLoading && <div>Caricamento files...</div>}
        
        {files?.map((file: MedicalFile) => (
          <div key={file.id} className="border rounded-lg p-4 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileIcon size={24} />
              </div>
              <div className="truncate">
                <p className="font-medium text-sm truncate">{file.fileName}</p>
                <p className="text-xs text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleView(file)}
                disabled={!!loadingFileId}
            >
              {loadingFileId === file.id ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        ))}
        
        {!isLoading && files?.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            Nessun file caricato per questo paziente.
          </div>
        )}
      </div>

      {/* Viewer Modale */}
      {viewingUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
           <div className="h-12 bg-slate-900 flex justify-end px-4 items-center">
             <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm" onClick={() => setViewingUrl(null)}>Chiudi Viewer</Button>
           </div>
           <DicomViewer imageUrl={viewingUrl} /> 
        </div>
      )}
    </div>
  );
}
