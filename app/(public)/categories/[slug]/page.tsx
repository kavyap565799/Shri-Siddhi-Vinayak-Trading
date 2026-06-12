import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { LOCAL_CATEGORIES } from '@/lib/constants';
import type { Category, ProductWithRelations } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: dbCategory } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single();

  const category = dbCategory || LOCAL_CATEGORIES.find(c => c.slug === slug);

  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} Products`,
    description: category.description || `Browse all ${category.name} products`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbCategory } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  const category = dbCategory || LOCAL_CATEGORIES.find(c => c.slug === slug);

  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url),
      category:categories(id, name, slug)
    `)
    .eq('category_id', category.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  const typedCategory = category as Category;
  const typedProducts = (products || []) as ProductWithRelations[];

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Link
          href="/categories"
          className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All Categories
        </Link>

        <div className="mb-8">
          <h1 className="font-[var(--font-heading)] text-2xl font-extrabold text-text-dark sm:text-3xl">
            {typedCategory.name}
          </h1>
          {typedCategory.description && (
            <p className="mt-2 text-text-muted">{typedCategory.description}</p>
          )}
          <p className="mt-1 text-sm text-text-muted">
            {typedProducts.length} product{typedProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <ProductGrid
          products={typedProducts}
          emptyMessage={`No products found in ${typedCategory.name}`}
        />
      </div>
    </div>
  );
}
