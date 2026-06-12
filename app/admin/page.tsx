import Link from 'next/link';
import { Package, Tags, Building, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import type { Enquiry } from '@/types';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [productsRes, brandsRes, categoriesRes, enquiriesRes, recentEnquiriesRes] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('brands').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

  const stats = [
    {
      label: 'Total Products',
      value: productsRes.count || 0,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Brands',
      value: brandsRes.count || 0,
      icon: Building,
      href: '/admin/brands',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Categories',
      value: categoriesRes.count || 0,
      icon: Tags,
      href: '/admin/categories',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'New Enquiries',
      value: enquiriesRes.count || 0,
      icon: MessageSquare,
      href: '/admin/enquiries',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const recentEnquiries = (recentEnquiriesRes.data || []) as Enquiry[];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted">Welcome back, Admin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-dark">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild className="bg-navy hover:bg-navy-light text-white">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-navy/20">
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-navy/20">
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Link>
        </Button>
      </div>

      {/* Recent Enquiries */}
      <div className="rounded-xl border border-border-light bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <h2 className="font-[var(--font-heading)] text-base font-bold text-text-dark">
            Recent Enquiries
          </h2>
          <Link href="/admin/enquiries" className="text-sm font-medium text-navy hover:text-navy-light flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border-light">
          {recentEnquiries.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-text-muted">
              No enquiries yet
            </p>
          ) : (
            recentEnquiries.map((enq) => (
              <div key={enq.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-text-dark">{enq.name}</p>
                  <p className="text-xs text-text-muted">{enq.phone} • {enq.message?.slice(0, 60)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      enq.status === 'new'
                        ? 'default'
                        : enq.status === 'contacted'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      enq.status === 'new'
                        ? 'bg-orange text-white'
                        : ''
                    }
                  >
                    {enq.status}
                  </Badge>
                  <span className="text-xs text-text-muted">{formatDateTime(enq.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
