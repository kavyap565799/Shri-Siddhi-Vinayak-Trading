'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Brand } from '@/types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('display_order', { ascending: true });
    setBrands((data || []) as Brand[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const deleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete brand');
    } else {
      toast.success('Brand deleted');
      fetchBrands();
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
          Brands
        </h1>
        <Button asChild className="bg-navy hover:bg-navy-light text-white">
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                  No brands added yet
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-text-muted text-sm">{brand.slug}</TableCell>
                  <TableCell>
                    {brand.is_featured && (
                      <Badge className="bg-orange text-white text-xs">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell>{brand.display_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-navy hover:bg-navy/5"
                      >
                        <Link href={`/admin/brands/${brand.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBrand(brand.id)}
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
