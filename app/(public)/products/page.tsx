import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilter } from '@/components/products/ProductFilter';
import { getMergedBrands } from '@/lib/constants';
import type { ProductWithRelations, Brand, Category } from '@/types';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our complete catalog of industrial tools, power tools, welding accessories, safety equipment, and more.',
};

interface Props {
  searchParams: Promise<{
    brand?: string;
    category?: string;
    search?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url),
      category:categories(id, name, slug)
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (params.brand) {
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', params.brand)
      .single();
    if (brand) query = query.eq('brand_id', brand.id);
  }

  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    if (category) query = query.eq('category_id', category.id);
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  if (params.featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const [productsRes, brandsRes, categoriesRes] = await Promise.all([
    query,
    supabase.from('brands').select('*').order('name'),
    supabase.from('categories').select('*').is('parent_id', null).order('name'),
  ]);

  const products = (productsRes.data || []) as ProductWithRelations[];
  const brands = getMergedBrands(brandsRes.data || []) as Brand[];
  const categories = (categoriesRes.data || []) as Category[];

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            All <span className="text-navy">Products</span>
          </h1>
          <p className="mt-2 text-text-muted">
            {products.length} products available
          </p>
        </div>

        {/* Filters */}
        <ProductFilter
          brands={brands}
          categories={categories}
          currentBrand={params.brand}
          currentCategory={params.category}
          currentSearch={params.search}
        />

        {/* Grid */}
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
