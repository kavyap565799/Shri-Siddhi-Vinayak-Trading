'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
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
              className="h-full"
            >
              <ProductCard product={product} />
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
