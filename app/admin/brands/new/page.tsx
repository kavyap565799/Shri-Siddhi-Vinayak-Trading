'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { toSlug } from '@/lib/utils';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  is_featured: z.boolean(),
  display_order: z.number(),
});

type BrandForm = z.infer<typeof brandSchema>;

export default function NewBrandPage() {  
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { is_featured: false, display_order: 0 },
  });

  const isFeatured = watch('is_featured');

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    setValue('slug', toSlug(name));
  };

  const onSubmit = async (data: BrandForm) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('brands').insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logo_url: logoUrl || null,
        is_featured: data.is_featured,
        display_order: data.display_order,
      });

      if (error) throw error;
      toast.success('Brand created successfully!');
      router.push('/admin/brands');
    } catch (err: any) {
      console.error('Create brand error:', err);
      let message = err?.message || 'Failed to create brand';
      if (message.includes('brands_slug_key')) {
        message = 'A brand with this name or slug already exists. Please choose a different name or modify the slug.';
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/brands"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Brands
      </Link>

      <h1 className="mb-6 font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
        Create New Brand
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-border-light bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="brand-name">Brand Name *</Label>
          <Input
            id="brand-name"
            {...register('name')}
            onChange={onNameChange}
            placeholder="e.g. Bosch"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-slug">Slug</Label>
          <Input id="brand-slug" {...register('slug')} placeholder="auto-generated" />
          {errors.slug && (
            <p className="text-xs text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Brand Logo</Label>
          <ImageUpload
            bucket="brand-logos"
            value={logoUrl}
            onChange={(url) => setLogoUrl(url as string)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-desc">Description</Label>
          <Textarea
            id="brand-desc"
            {...register('description')}
            rows={3}
            placeholder="Brief description of the brand"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
          <div>
            <Label>Featured Brand</Label>
            <p className="text-xs text-text-muted">Show in Top Brands section</p>
          </div>
          <Switch
            checked={isFeatured}
            onCheckedChange={(checked) => setValue('is_featured', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-order">Display Order</Label>
          <Input
            id="brand-order"
            type="number"
            {...register('display_order', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-navy hover:bg-navy-light text-white font-semibold h-11"
        >
          {saving ? 'Saving...' : 'Create Brand'}
        </Button>
      </form>
    </div>
  );
}
