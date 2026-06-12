import { ProductCard } from './ProductCard';
import type { ProductWithRelations } from '@/types';

interface ProductGridProps {
  products: ProductWithRelations[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = 'No products found' }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border-light bg-white">
        <div className="text-center">
          <span className="text-4xl">📦</span>
          <p className="mt-2 text-text-muted">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
