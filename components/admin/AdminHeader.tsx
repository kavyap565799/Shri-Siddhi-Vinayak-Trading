'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border-light bg-white px-4 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        <span className="hidden text-sm font-medium text-text-dark sm:inline">
          Admin
        </span>
      </div>
    </header>
  );
}
