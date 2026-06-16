'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Brand, Category } from '@/types';
import { useCallback, useState } from 'react';

interface ProductFilterProps {
  brands: Brand[];
  categories: Category[];
  currentBrand?: string;
  currentCategory?: string;
  currentSearch?: string;
}

export function ProductFilter({
  brands,
  categories,
  currentBrand,
  currentCategory,
  currentSearch,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'Brand' && value !== 'Categories' && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', search || null);
  };

  const clearFilters = () => {
    router.push('/products');
    setSearch('');
  };

  const hasFilters = currentBrand || currentCategory || currentSearch;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-10 border-border-light"
        />
      </form>

      {/* Brand Filter */}
      <Select
        value={currentBrand || 'Brand'}
        onValueChange={(v) => updateFilter('brand', v)}
      >
        <SelectTrigger className="w-full sm:w-44 border-border-light">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Brand">Brand</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.slug}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={currentCategory || 'Categories'}
        onValueChange={(v) => updateFilter('category', v)}
      >
        <SelectTrigger className="w-full sm:w-44 border-border-light">
          <SelectValue placeholder="Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Categories">Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-text-muted hover:text-destructive"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
