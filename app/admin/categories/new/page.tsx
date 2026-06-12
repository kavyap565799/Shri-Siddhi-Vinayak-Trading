'use client';

import { useEffect, useState } from 'react';
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
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parent_id: z.string().nullable(),
  display_order: z.number(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const [iconUrl, setIconUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { display_order: 0, parent_id: null },
  });

  useEffect(() => {
    const fetchParents = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name');
      setParentCategories((data || []) as Category[]);
    };
    fetchParents();
  }, []);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    setValue('slug', toSlug(name));
  };

  const onSubmit = async (data: CategoryForm) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon_url: iconUrl || null,
        parent_id: data.parent_id || null,
        display_order: data.display_order,
      });

      if (error) throw error;
      toast.success('Category created successfully!');
      router.push('/admin/categories');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Categories
      </Link>

      <h1 className="mb-6 font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
        Create New Category
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-border-light bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="cat-name">Category Name *</Label>
          <Input
            id="cat-name"
            {...register('name')}
            onChange={onNameChange}
            placeholder="e.g. Power Tools"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input id="cat-slug" {...register('slug')} placeholder="auto-generated" />
        </div>

        <div className="space-y-2">
          <Label>Parent Category (optional)</Label>
          <Select
            onValueChange={(v: string | null) => setValue('parent_id', (v === 'none' || v === null) ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No parent (top-level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent (top-level)</SelectItem>
              {parentCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category Icon</Label>
          <ImageUpload
            bucket="category-icons"
            value={iconUrl}
            onChange={(url) => setIconUrl(url as string)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-desc">Description</Label>
          <Textarea
            id="cat-desc"
            {...register('description')}
            rows={3}
            placeholder="Brief description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-order">Display Order</Label>
          <Input
            id="cat-order"
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
          {saving ? 'Saving...' : 'Create Category'}
        </Button>
      </form>
    </div>
  );
}
