'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';
import { toSlug } from '@/lib/utils';
import type { Brand, Category, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  price_display: z.string().optional(),
  brand_id: z.string().optional(),
  category_id: z.string().optional(),
  is_featured: z.boolean(),
  is_available: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { is_featured: false, is_available: true },
  });

  const isFeatured = watch('is_featured');
  const isAvailable = watch('is_available');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const [productRes, brandsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('brands').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productRes.data) {
        const p = productRes.data as Product;
        reset({
          name: p.name,
          slug: p.slug,
          sku: p.sku || '',
          description: p.description || '',
          price_display: p.price_display || '',
          brand_id: p.brand_id || '',
          category_id: p.category_id || '',
          is_featured: p.is_featured,
          is_available: p.is_available,
        });
        setImages(p.images || []);
        if (p.specifications) {
          setSpecs(
            Object.entries(p.specifications).map(([key, value]) => ({ key, value }))
          );
        }
      }

      setBrands((brandsRes.data || []) as Brand[]);
      setCategories((categoriesRes.data || []) as Category[]);
      setLoading(false);
    };
    fetchData();
  }, [id, reset]);

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      const supabase = createClient();

      const specifications: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
      });

      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          slug: data.slug,
          sku: data.sku || null,
          description: data.description || null,
          price_display: data.price_display || null,
          specifications: Object.keys(specifications).length ? specifications : null,
          brand_id: data.brand_id || null,
          category_id: data.category_id || null,
          images: images,
          primary_image_url: images[0] || null,
          is_featured: data.is_featured,
          is_available: data.is_available,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Update product error:', err);
      let message = err?.message || 'Failed to update product';
      if (message.includes('products_slug_key')) {
        message = 'A product with this name or slug already exists. Please choose a different name or modify the slug.';
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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <h1 className="mb-6 font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
        Edit Product
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-border-light bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-prod-name">Product Name *</Label>
            <Input id="edit-prod-name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prod-slug">Slug</Label>
            <Input id="edit-prod-slug" {...register('slug')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prod-sku">SKU</Label>
            <Input id="edit-prod-sku" {...register('sku')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-prod-desc">Description</Label>
          <Textarea id="edit-prod-desc" {...register('description')} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-prod-price">Price Display</Label>
          <Input id="edit-prod-price" {...register('price_display')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={watch('brand_id') || 'none'}
              onValueChange={(v: string | null) => setValue('brand_id', (v === 'none' || v === null) ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand">
                  {watch('brand_id') ? brands.find(b => b.id === watch('brand_id'))?.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No brand</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={watch('category_id') || 'none'}
              onValueChange={(v: string | null) => setValue('category_id', (v === 'none' || v === null) ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {watch('category_id') ? categories.find(c => c.id === watch('category_id'))?.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Specifications</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addSpec}>
              <Plus className="mr-1 h-4 w-4" /> Add Spec
            </Button>
          </div>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Key"
                value={spec.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(i)}
                className="text-red-500 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Product Images</Label>
          <ImageUpload
            bucket="product-images"
            value={images}
            onChange={(urls) => setImages(urls as string[])}
            multiple
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
            <div>
              <Label>Featured</Label>
              <p className="text-xs text-text-muted">Show on homepage</p>
            </div>
            <Switch
              checked={isFeatured}
              onCheckedChange={(c) => setValue('is_featured', c)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
            <div>
              <Label>Available</Label>
              <p className="text-xs text-text-muted">In stock</p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={(c) => setValue('is_available', c)}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-navy hover:bg-navy-light text-white font-semibold h-11"
        >
          {saving ? 'Updating...' : 'Update Product'}
        </Button>
      </form>
    </div>
  );
}
