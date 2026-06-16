import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getMergedBrands } from '@/lib/constants';
import type { Brand } from '@/types';

export const metadata: Metadata = {
  title: 'All Brands',
  description: 'Browse all the trusted industrial tool brands we carry.',
};

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('display_order', { ascending: true });

  const allBrands = getMergedBrands(brands || []) as Brand[];

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            Our <span className="text-navy">Brands</span>
          </h1>
          <p className="mt-2 text-text-muted">
            Authorized dealer for {allBrands.length}+ leading industrial brands
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBrands.map((brand) => (
            <Link
              key={brand.id}
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
            </Link>
          ))}
        </div>

        {allBrands.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border-light bg-white">
            <div className="text-center">
              <span className="text-4xl">🏭</span>
              <p className="mt-2 text-text-muted">No brands added yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
