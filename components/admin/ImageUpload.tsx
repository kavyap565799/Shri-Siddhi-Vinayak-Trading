'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, type StorageBucket } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';

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

  const urls = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
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
        e.target.value = '';
      }
    },
    [bucket, folder, multiple, onChange, urls]
  );

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
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-light bg-gray-50 p-6 transition-colors hover:border-navy/30 hover:bg-gray-100',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
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
            : multiple
            ? 'Click to upload images'
            : 'Click to upload image'}
        </p>
        <p className="text-xs text-text-muted/60">PNG, JPG, WebP up to 5MB</p>
      </label>
    </div>
  );
}
