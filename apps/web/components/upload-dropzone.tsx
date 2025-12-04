import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast'; 

const getAuthToken = () => localStorage.getItem('token'); 

export function UploadDropzone({ patientId, onUploadComplete }: { patientId: string, onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      toast({ title: "Errore", description: "Sessione scaduta. Effettua il login.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Chiedi URL firmato
      const resSign = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/sign-upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        })
      });
      
      if (!resSign.ok) throw new Error('Impossibile ottenere URL di upload');
      const { uploadUrl, fileKey } = await resSign.json();

      // 2. Upload su GCS
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          // 3. Conferma upload
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storage/confirm-upload`, {
             method: 'POST',
             headers: { 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ 
                 fileKey, 
                 patientId,
                 fileName: file.name,
                 mimeType: file.type,
                 sizeBytes: file.size
             })
          });
          
          toast({ title: "Successo", description: "File caricato correttamente." });
          if (onUploadComplete) onUploadComplete();
        } else {
          throw new Error('Errore durante caricamento GCS');
        }
        setUploading(false);
      };

      xhr.onerror = () => { throw new Error('Errore di rete'); };
      xhr.send(file);

    } catch (err) {
      console.error(err);
      toast({ title: "Errore", description: "Caricamento fallito.", variant: "destructive" });
      setUploading(false);
    }
  }, [patientId, onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <Upload className="text-slate-400" />
          </div>
          <div className="text-sm font-medium text-slate-700">
            {isDragActive ? "Rilascia qui" : "Trascina file o clicca"}
          </div>
          <p className="text-xs text-slate-500">DICOM, STL, PDF (Max 500MB)</p>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Caricamento... {Math.round(progress)}%</span>
            {progress === 100 && <Loader2 className="animate-spin h-3 w-3" />}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
