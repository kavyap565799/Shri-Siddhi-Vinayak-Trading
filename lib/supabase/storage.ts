export type StorageBucket = 'product-images' | 'brand-logos' | 'category-icons';

export async function uploadImage(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder || `shri-siddhi-vinayak/${bucket}`);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.url;
}

export async function deleteImage(
  url: string,
  bucket: StorageBucket
): Promise<void> {
  // Extract the public ID from the full Cloudinary URL
  const parts = url.split('/upload/');
  if (parts.length < 2) return;

  let publicIdWithExt = parts[1];
  if (publicIdWithExt.startsWith('v')) {
    const nextSlash = publicIdWithExt.indexOf('/');
    publicIdWithExt = publicIdWithExt.substring(nextSlash + 1);
  }

  const lastDot = publicIdWithExt.lastIndexOf('.');
  const publicId =
    lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

  const response = await fetch(
    `/api/upload?publicId=${encodeURIComponent(publicId)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete image from Cloudinary');
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
