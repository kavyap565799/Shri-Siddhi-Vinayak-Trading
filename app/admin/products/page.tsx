'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProductWithRelations } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(id, name, slug, logo_url),
        category:categories(id, name, slug)
      `)
      .order('created_at', { ascending: false });
    setProducts((data || []) as ProductWithRelations[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
          Products
        </h1>
        <Button asChild className="bg-navy hover:bg-navy-light text-white">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                  No products added yet
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-text-dark">{product.name}</p>
                      {product.sku && (
                        <p className="text-xs text-text-muted">SKU: {product.sku}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">
                    {product.brand?.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">
                    {product.category?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.is_featured && (
                        <Badge className="bg-orange text-white text-xs">Featured</Badge>
                      )}
                      {!product.is_available && (
                        <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-navy hover:bg-navy/5"
                      >
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
