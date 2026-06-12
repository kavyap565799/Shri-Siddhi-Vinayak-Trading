import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, Zap, Shield, Flame, Package, Ruler } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types';

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse products by category — industrial tools, power tools, welding, safety equipment, and more.',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  default: <Package className="h-8 w-8" />,
  'hand-tools': <Wrench className="h-8 w-8" />,
  'power-tools': <Zap className="h-8 w-8" />,
  'safety-equipment': <Shield className="h-8 w-8" />,
  'welding-accessories': <Flame className="h-8 w-8" />,
  'project-materials': <Ruler className="h-8 w-8" />,
};

const ICON_COLORS = [
  'text-blue-600 bg-blue-100',
  'text-orange-600 bg-orange-100',
  'text-green-600 bg-green-100',
  'text-purple-600 bg-purple-100',
  'text-red-600 bg-red-100',
  'text-cyan-600 bg-cyan-100',
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('display_order', { ascending: true });

  const allCategories = (categories || []) as Category[];

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            Product <span className="text-navy">Categories</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Browse our organized product categories
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allCategories.map((category, index) => {
            const iconColor = ICON_COLORS[index % ICON_COLORS.length];
            const icon = CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconColor} transition-transform group-hover:scale-110`}
                >
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
                    <p className="mt-1 text-sm text-text-muted line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {allCategories.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border-light bg-white">
            <div className="text-center">
              <span className="text-4xl">📂</span>
              <p className="mt-2 text-text-muted">No categories added yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
