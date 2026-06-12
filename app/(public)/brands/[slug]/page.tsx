import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { Brand, ProductWithRelations } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: brand } = await supabase
    .from('brands')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!brand) return { title: 'Brand Not Found' };
  return {
    title: `${brand.name} Products`,
    description: brand.description || `Browse all ${brand.name} products`,
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!brand) notFound();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url),
      category:categories(id, name, slug)
    `)
    .eq('brand_id', brand.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  const typedBrand = brand as Brand;
  const typedProducts = (products || []) as ProductWithRelations[];

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Link
          href="/brands"
          className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All Brands
        </Link>

        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-6 rounded-xl border border-border-light bg-white p-6 shadow-sm">
          {typedBrand.logo_url ? (
            <Image
              src={typedBrand.logo_url}
              alt={typedBrand.name}
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-navy/5">
              <span className="text-3xl font-bold text-navy">
                {typedBrand.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl font-extrabold text-text-dark sm:text-3xl">
              {typedBrand.name}
            </h1>
            {typedBrand.description && (
              <p className="mt-1 text-text-muted">{typedBrand.description}</p>
            )}
            <p className="mt-1 text-sm text-text-muted">
              {typedProducts.length} product{typedProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        <ProductGrid
          products={typedProducts}
          emptyMessage={`No products found for ${typedBrand.name}`}
        />
      </div>
    </div>
  );
}
