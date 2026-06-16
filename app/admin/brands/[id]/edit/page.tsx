'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { toSlug } from '@/lib/utils';
import type { Brand } from '@/types';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  is_featured: z.boolean(),
  display_order: z.number(),
});

type BrandForm = z.infer<typeof brandSchema>;

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { is_featured: false, display_order: 0 },
  });

  const isFeatured = watch('is_featured');

  useEffect(() => {
    const fetchBrand = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Failed to load brand');
        router.push('/admin/brands');
        return;
      }

      if (data) {
        const b = data as Brand;
        reset({
          name: b.name,
          slug: b.slug,
          description: b.description || '',
          is_featured: b.is_featured,
          display_order: b.display_order,
        });
        setLogoUrl(b.logo_url || '');
      }
      setLoading(false);
    };

    fetchBrand();
  }, [id, reset, router]);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    setValue('slug', toSlug(name));
  };

  const onSubmit = async (data: BrandForm) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('brands')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          logo_url: logoUrl || null,
          is_featured: data.is_featured,
          display_order: data.display_order,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Brand updated successfully!');
      router.push('/admin/brands');
    } catch (err: any) {
      console.error('Update brand error:', err);
      let message = err?.message || 'Failed to update brand';
      if (message.includes('brands_slug_key')) {
        message = 'A brand with this name or slug already exists. Please choose a different name or modify the slug.';
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/brands"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Brands
      </Link>

      <h1 className="mb-6 font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
        Edit Brand
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
          {saving ? 'Saving...' : 'Update Brand'}
        </Button>
      </form>
    </div>
  );
}
