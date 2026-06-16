import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Phone, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getWhatsAppProductUrl, SITE_CONFIG } from '@/lib/constants';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import type { ProductWithRelations } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description || `View details for ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url),
      category:categories(id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  const typedProduct = product as ProductWithRelations;
  const specs = typedProduct.specifications || {};
  const images = typedProduct.images || [];
  const allImages = typedProduct.primary_image_url
    ? [typedProduct.primary_image_url, ...images.filter((img) => img !== typedProduct.primary_image_url)]
    : images;

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link href="/products" className="hover:text-navy transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Products
          </Link>
          {typedProduct.category && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${typedProduct.category.slug}`}
                className="hover:text-navy transition-colors"
              >
                {typedProduct.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-text-dark font-medium truncate">{typedProduct.name}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <ProductImageGallery allImages={allImages} name={typedProduct.name} />

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {typedProduct.brand && (
                <Link href={`/brands/${typedProduct.brand.slug}`}>
                  <Badge
                    variant="secondary"
                    className="text-xs hover:bg-navy/10 transition-colors"
                  >
                    {typedProduct.brand.name}
                  </Badge>
                </Link>
              )}
              {typedProduct.category && (
                <Link href={`/categories/${typedProduct.category.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-xs border-orange/30 text-orange hover:bg-orange/10 transition-colors"
                  >
                    {typedProduct.category.name}
                  </Badge>
                </Link>
              )}
              {!typedProduct.is_available && (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>

            <h1 className="mt-4 font-[var(--font-heading)] text-2xl font-extrabold text-text-dark sm:text-3xl">
              {typedProduct.name}
            </h1>

            {typedProduct.sku && (
              <p className="mt-1 text-sm text-text-muted">SKU: {typedProduct.sku}</p>
            )}

            {typedProduct.price_display && (
              <p className="mt-4 text-2xl font-bold text-navy">
                {typedProduct.price_display}
              </p>
            )}

            {typedProduct.description && (
              <div className="mt-6">
                <h3 className="font-[var(--font-heading)] text-sm font-bold uppercase tracking-wider text-text-muted">
                  Description
                </h3>
                <p className="mt-2 text-text-muted leading-relaxed whitespace-pre-line">
                  {typedProduct.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="mt-6">
                <h3 className="font-[var(--font-heading)] text-sm font-bold uppercase tracking-wider text-text-muted">
                  Specifications
                </h3>
                <div className="mt-3 rounded-lg border border-border-light overflow-hidden">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <span className="font-medium text-text-dark">{key}</span>
                      <span className="text-text-muted">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="flex-1 bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold h-12"
              >
                <a
                  href={getWhatsAppProductUrl(typedProduct.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enquire on WhatsApp
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-navy text-navy hover:bg-navy hover:text-white font-semibold h-12"
              >
                <a href={SITE_CONFIG.contact.phone1Link}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
