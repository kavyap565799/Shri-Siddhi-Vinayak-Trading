import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/landing/HeroSection';
import { BrandScrollBanner } from '@/components/landing/BrandScrollBanner';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { TopBrandsSection } from '@/components/landing/TopBrandsSection';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { AboutSection } from '@/components/landing/AboutSection';
import { EnquirySection } from '@/components/landing/EnquirySection';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { getMergedBrands } from '@/lib/constants';
import type { Brand, Category, ProductWithRelations } from '@/types';

async function getPageData() {
  const supabase = await createClient();

  const [brandsRes, categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('brands')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select(`
        *,
        brand:brands(id, name, slug, logo_url),
        category:categories(id, name, slug)
      `)
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return {
    brands: getMergedBrands(brandsRes.data || []) as Brand[],
    categories: (categoriesRes.data || []) as Category[],
    products: (productsRes.data || []) as ProductWithRelations[],
  };
}

export default async function HomePage() {
  const { brands, categories, products } = await getPageData();
  const featuredBrands = brands.filter((b) => b.is_featured);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BrandScrollBanner brands={brands} />
        <CategoriesSection categories={categories} />
        <TopBrandsSection brands={featuredBrands} />
        <FeaturedProducts products={products} />
        <AboutSection />
        <EnquirySection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
