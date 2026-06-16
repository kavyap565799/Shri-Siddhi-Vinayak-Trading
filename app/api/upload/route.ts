import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

// Configure Cloudinary using server-side environment variables
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'shri-siddhi-vinayak';
    const bucket = (formData.get('bucket') as string) || 'product-images';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary using upload_stream
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return NextResponse.json({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    } else {
      // Fallback to Supabase Storage
      const supabase = await createClient();
      
      // Clean up filename and build path
      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = folder ? `${folder}/${cleanFileName}` : cleanFileName;

      // Try uploading to Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        // If bucket doesn't exist, try to create it and retry upload
        if (error.message.includes('Bucket not found') || (error as any).status === 404) {
          const { error: createBucketErr } = await supabase.storage.createBucket(bucket, {
            public: true,
          });
          if (createBucketErr) {
            throw new Error(`Bucket "${bucket}" not found and auto-creation failed: ${createBucketErr.message}`);
          }
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: true,
            });
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return NextResponse.json({
        url: publicUrl,
        public_id: filePath,
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');
    const bucket = searchParams.get('bucket') || 'product-images';
    const isSupabase = searchParams.get('isSupabase') === 'true';

    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 });
    }

    if (isSupabase || !isCloudinaryConfigured) {
      const supabase = await createClient();
      const { error } = await supabase.storage.from(bucket).remove([publicId]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else {
      const result = await cloudinary.uploader.destroy(publicId);
      return NextResponse.json({ success: true, result });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
