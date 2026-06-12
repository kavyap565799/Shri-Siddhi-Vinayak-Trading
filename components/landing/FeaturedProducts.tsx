'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getWhatsAppProductUrl } from '@/lib/constants';
import type { ProductWithRelations } from '@/types';

interface FeaturedProductsProps {
  products: ProductWithRelations[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            Featured{' '}
            <span className="text-navy">Products</span>
          </h2>
          <p className="mt-3 text-text-muted">
            Popular picks from our extensive product catalog
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="group overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative block aspect-square overflow-hidden bg-gray-50"
                >
                  {product.primary_image_url ? (
                    <Image
                      src={product.primary_image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl text-text-muted/20">🔧</span>
                    </div>
                  )}
                  {product.brand && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs"
                    >
                      {product.brand.name}
                    </Badge>
                  )}
                </Link>

                {/* Content */}
                <div className="p-4">
                  {product.category && (
                    <span className="text-xs font-medium text-orange">
                      {product.category.name}
                    </span>
                  )}
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mt-1 font-[var(--font-heading)] text-sm font-bold text-text-dark line-clamp-2 group-hover:text-navy transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {product.price_display && (
                    <p className="mt-2 text-sm font-semibold text-navy">
                      {product.price_display}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-whatsapp hover:bg-whatsapp-dark text-white text-xs h-9"
                    >
                      <a
                        href={getWhatsAppProductUrl(product.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-1 h-3.5 w-3.5" />
                        Enquire
                      </a>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs h-9 border-navy/20 text-navy hover:bg-navy hover:text-white"
                    >
                      <Link href={`/products/${product.slug}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-navy text-navy hover:bg-navy hover:text-white font-semibold"
          >
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
