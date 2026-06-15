import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getWhatsAppProductUrl } from '@/lib/constants';
import type { ProductWithRelations } from '@/types';

interface ProductCardProps {
  product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <span className="text-5xl opacity-20">🔧</span>
          </div>
        )}

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
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

        {product.is_featured && (
          <Badge className="absolute top-3 right-3 bg-orange text-white text-xs">
            Featured
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs font-medium text-orange hover:text-orange-dark transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-1 font-[var(--font-heading)] text-sm font-bold text-text-dark line-clamp-2 group-hover:text-navy transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.sku && (
            <p className="mt-1 text-xs text-text-muted">SKU: {product.sku}</p>
          )}

          {product.price_display && (
            <p className="mt-2 text-sm font-semibold text-navy">
              {product.price_display}
            </p>
          )}
        </div>

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
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
