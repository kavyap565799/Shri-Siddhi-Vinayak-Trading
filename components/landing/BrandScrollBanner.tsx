import Link from 'next/link';
import Image from 'next/image';
import type { Brand } from '@/types';

interface BrandScrollBannerProps {
  brands: Brand[];
}

export function BrandScrollBanner({ brands }: BrandScrollBannerProps) {
  if (!brands.length) return null;

  // Repeat brands to ensure it spans much wider than any viewport width
  let displayBrands = [...brands];
  while (displayBrands.length > 0 && displayBrands.length < 24) {
    displayBrands = [...displayBrands, ...brands];
  }

  // Duplicate the final set for seamless infinite scroll
  const doubled = [...displayBrands, ...displayBrands];

  return (
    <section className="brand-scroll-container overflow-hidden border-y border-border-light bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
          Trusted Brands We Carry
        </p>
      </div>
      <div className="relative">
        {/* Gradient fades on edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

        <div className="brand-scroll-track flex w-max animate-scroll items-center gap-14 px-8">
          {doubled.map((brand, i) => (
            <Link
              key={`${brand.id}-${i}`}
              href={`/brands/${brand.slug}`}
              className="flex h-16 w-40 shrink-0 items-center justify-center transition-all hover:scale-110"
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={160}
                  height={64}
                  className="h-12 w-auto max-w-full object-contain opacity-90 transition-all hover:opacity-100"
                  style={{ width: 'auto' }}
                />
              ) : (
                <span className="text-lg font-bold text-text-muted/40 transition-colors hover:text-navy">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
