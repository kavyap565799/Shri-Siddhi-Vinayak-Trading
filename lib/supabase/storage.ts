export type StorageBucket = 'product-images' | 'brand-logos' | 'category-icons';

export async function uploadImage(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('folder', folder || `shri-siddhi-vinayak/${bucket}`);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}

export async function deleteImage(
  url: string,
  bucket: StorageBucket
): Promise<void> {
  let publicId = '';
  let isSupabase = false;

  if (url.includes('/storage/v1/object/public/')) {
    isSupabase = true;
    const matchString = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(matchString);
    if (index !== -1) {
      publicId = url.substring(index + matchString.length);
    }
  } else {
    const parts = url.split('/upload/');
    if (parts.length >= 2) {
      let publicIdWithExt = parts[1];
      if (publicIdWithExt.startsWith('v')) {
        const nextSlash = publicIdWithExt.indexOf('/');
        publicIdWithExt = publicIdWithExt.substring(nextSlash + 1);
      }
      const lastDot = publicIdWithExt.lastIndexOf('.');
      publicId = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
    }
  }

  if (!publicId) return;

  const response = await fetch(
    `/api/upload?publicId=${encodeURIComponent(publicId)}&bucket=${bucket}&isSupabase=${isSupabase}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete image');
  }
}

export async function uploadMultipleImages(
  files: File[],
  bucket: StorageBucket,
  folder?: string
): Promise<string[]> {
  const urls = await Promise.all(
    files.map((file) => uploadImage(file, bucket, folder))
  );
  return urls;
}
