'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';
import type { Enquiry } from '@/types';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    setEnquiries((data || []) as Enquiry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchEnquiries();
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
      <div className="mb-6">
        <h1 className="font-[var(--font-heading)] text-2xl font-extrabold text-text-dark">
          Enquiries
        </h1>
        <p className="text-sm text-text-muted">
          {enquiries.length} total enquiries
        </p>
      </div>

      <div className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No enquiries yet
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-text-dark">{enq.name}</p>
                      {enq.email && (
                        <p className="text-xs text-text-muted">{enq.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${enq.phone}`}
                      className="text-sm text-navy hover:underline"
                    >
                      {enq.phone}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm text-text-muted truncate">
                      {enq.message || '—'}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">
                    {enq.product_name || '—'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={enq.status}
                      onValueChange={(v: string | null) => updateStatus(enq.id, v || 'new')}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-text-muted whitespace-nowrap">
                    {formatDateTime(enq.created_at)}
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
