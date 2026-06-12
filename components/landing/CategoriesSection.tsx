'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Wrench, Zap, Shield, Flame, Package, Ruler } from 'lucide-react';
import type { Category } from '@/types';

interface CategoriesSectionProps {
  categories: Category[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  default: <Package className="h-8 w-8" />,
  'hand-tools': <Wrench className="h-8 w-8" />,
  'power-tools': <Zap className="h-8 w-8" />,
  'safety-equipment': <Shield className="h-8 w-8" />,
  'welding-accessories': <Flame className="h-8 w-8" />,
  'project-materials': <Ruler className="h-8 w-8" />,
  'industrial-tools': <Wrench className="h-8 w-8" />,
};

const GRADIENT_COLORS = [
  'from-blue-500/10 to-blue-600/5',
  'from-orange-500/10 to-orange-600/5',
  'from-green-500/10 to-green-600/5',
  'from-purple-500/10 to-purple-600/5',
  'from-red-500/10 to-red-600/5',
  'from-cyan-500/10 to-cyan-600/5',
];

const ICON_COLORS = [
  'text-blue-600 bg-blue-100',
  'text-orange-600 bg-orange-100',
  'text-green-600 bg-green-100',
  'text-purple-600 bg-purple-100',
  'text-red-600 bg-red-100',
  'text-cyan-600 bg-cyan-100',
];

export function CategoriesSection({ categories }: CategoriesSectionProps) {
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
            Browse by{' '}
            <span className="text-navy">Category</span>
          </h2>
          <p className="mt-3 text-text-muted">
            Find exactly what you need from our organized product categories
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const gradientColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
            const iconColor = ICON_COLORS[index % ICON_COLORS.length];
            const icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className={`group flex items-center gap-4 rounded-xl bg-gradient-to-br ${gradientColor} border border-white/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconColor} transition-transform group-hover:scale-110`}>
                    {category.icon_url ? (
                      <Image
                        src={category.icon_url}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      icon
                    )}
                  </div>
                  <div>
                    <h3 className="font-[var(--font-heading)] text-lg font-bold text-text-dark group-hover:text-navy transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-text-muted line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-navy-light transition-colors"
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
