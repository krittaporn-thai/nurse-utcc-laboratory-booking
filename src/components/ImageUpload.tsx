import React, { useRef, useState } from 'react';
import { Upload, X, FileImage, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'อัปโหลดรูปภาพ (ไฟล์ .jpg, .jpeg, .png, .webp สูงสุด 5MB)',
  required = false,
  className = ''
}) => {
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError('');
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('กรุณาเลือกไฟล์รูปภาพประเภท .jpg, .jpeg, .png หรือ .webp เท่านั้น');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('ขนาดไฟล์เกินกำหนด (สูงสุด 5MB)');
      return;
    }

    setFileName(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block font-semibold text-xs text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="space-y-2">
          <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group shadow-sm">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setError('ไม่สามารถแสดงผลรูปภาพนี้ได้')}
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>เปลี่ยนรูปใหม่</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition flex items-center gap-1.5"
              >
                <X size={14} />
                <span>ลบรูปเดิม</span>
              </button>
            </div>
          </div>
          {fileName && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileImage size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{fileName}</span>
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-teal-50/30 dark:hover:bg-teal-950/20'
          }`}
        >
          <Upload size={28} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
            คลิกเพื่อเลือกรูปภาพ หรือ ลากไฟล์มาวาง
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            รองรับ JPG, JPEG, PNG, WEBP (ขนาดไม่เกิน 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
