import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, Trash2 } from 'lucide-react';

export interface UploadedFileInfo {
  name: string;
  size: string;
  type?: string;
}

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText = 'PDF, PNG, JPG, or DOCX up to 10MB',
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  multiple = false,
  onFilesSelected,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileList, setFileList] = useState<UploadedFileInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: UploadedFileInfo[] = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      type: f.type
    }));
    setFileList((prev) => (multiple ? [...prev, ...newFiles] : newFiles));
    if (onFilesSelected) {
      onFilesSelected(Array.from(files));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-white text-center ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-800">
          <span className="text-blue-600 underline">Click to upload</span> or drag and drop
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      </div>

      {fileList.length > 0 && (
        <div className="mt-3 space-y-2">
          {fileList.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <File className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{file.name}</span>
                <span className="text-slate-400 text-[10px]">({file.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
