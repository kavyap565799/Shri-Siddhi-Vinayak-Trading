'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Brand } from '@/types';

interface TopBrandsSectionProps {
  brands: Brand[];
}

export function TopBrandsSection({ brands }: TopBrandsSectionProps) {
  if (!brands.length) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            Top Brands{' '}
            <span className="text-orange">We Carry</span>
          </h2>
          <p className="mt-3 text-text-muted">
            Authorized dealer for leading industrial tool brands
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center rounded-xl border border-border-light bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-navy/20 hover:shadow-lg"
              >
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={100}
                    height={60}
                    className="mb-4 h-16 w-auto object-contain transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5">
                    <span className="text-2xl font-bold text-navy">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-[var(--font-heading)] text-base font-bold text-text-dark group-hover:text-navy transition-colors">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="mt-1 text-xs text-text-muted line-clamp-2">
                    {brand.description}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange opacity-0 transition-opacity group-hover:opacity-100">
                  View Products <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-navy-light transition-colors"
          >
            View All Brands →
          </Link>
        </div>
      </div>
    </section>
  );
}
