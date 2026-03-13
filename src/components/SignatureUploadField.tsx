import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function SignatureUploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {value ? (
        <div className="relative border rounded p-1 bg-white">
          <img src={value} alt={label} className="h-10 mx-auto object-contain" />
          <button onClick={() => onChange('')} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full border border-dashed rounded p-2 text-xs text-muted-foreground hover:bg-muted/50 flex items-center justify-center gap-1">
          <Upload className="h-3 w-3" /> Upload
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
