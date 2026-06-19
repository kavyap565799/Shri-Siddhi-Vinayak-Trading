'use client';

import { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Clipboard } from 'lucide-react';
import { uploadImage, type StorageBucket } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: StorageBucket;
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  multiple?: boolean;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  multiple = false,
  folder,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const urls = Array.isArray(value) ? value : value ? [value] : [];

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      setUploading(true);
      try {
        const uploadPromises = files.map((file) =>
          uploadImage(file, bucket, folder)
        );
        const newUrls = await Promise.all(uploadPromises);

        if (multiple) {
          onChange([...urls, ...newUrls]);
        } else {
          onChange(newUrls[0]);
        }
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, multiple, onChange, urls]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await uploadFiles(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragging(true);
  }, [uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (uploading) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      await uploadFiles(files);
    },
    [uploadFiles, uploading]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      if (uploading) return;

      const files = Array.from(e.clipboardData.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length > 0) {
        e.preventDefault();
        await uploadFiles(files);
      }
    },
    [uploadFiles, uploading]
  );

  const handleClipboardPaste = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (uploading) return;

      try {
        const clipboardItems = await navigator.clipboard.read();
        const files: File[] = [];
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const ext = type.split('/')[1] || 'png';
              const file = new File([blob], `pasted-image-${Date.now()}.${ext}`, { type });
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          toast.loading('Uploading pasted image...', { id: 'image-paste' });
          await uploadFiles(files);
          toast.success('Pasted image uploaded successfully!', { id: 'image-paste' });
        } else {
          toast.error('No image found in clipboard. Please copy an image first.', { id: 'image-paste' });
        }
      } catch (err: any) {
        console.error('Clipboard paste failed:', err);
        toast.error('Failed to read clipboard. Please ensure clipboard access is granted.', { id: 'image-paste' });
      }
    },
    [uploadFiles, uploading]
  );

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    if (multiple) {
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preview */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div
              key={i}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border-light"
            >
              <Image
                src={url}
                alt={`Upload ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
          triggerFileInput();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-light bg-gray-50 p-6 transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/50',
          isDragging && 'border-navy bg-navy/5 scale-[0.98]',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        ) : (
          <Upload className="h-8 w-8 text-text-muted" />
        )}
        <p className="mt-2 text-sm text-text-muted">
          {uploading
            ? 'Uploading...'
            : isDragging
            ? 'Drop to upload'
            : multiple
            ? 'Click, Drag & Drop, or Paste to upload images'
            : 'Click, Drag & Drop, or Paste to upload image'}
        </p>

        {!uploading && !isDragging && (
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerFileInput();
              }}
              className="flex items-center gap-1.5 rounded-md border border-border-light bg-white px-3 py-1.5 text-xs font-semibold text-text-dark shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={handleClipboardPaste}
              className="flex items-center gap-1.5 rounded-md border border-border-light bg-white px-3 py-1.5 text-xs font-semibold text-text-dark shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <Clipboard className="h-3.5 w-3.5 text-navy" />
              Paste Photo
            </button>
          </div>
        )}

        <p className="mt-2 text-xs text-text-muted/60">PNG, JPG, WebP up to 5MB (Ctrl+V to paste when focused)</p>
      </div>
    </div>
  );
}
