'use client';
import { Ship } from 'lucide-react';
import Link from 'next/link';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="NeedPort home" className={`flex items-center gap-2 ${className}`}>
      <Ship className="w-6 h-6 text-brand-600" />
      <span className="font-semibold tracking-tight">NeedPort</span>
    </Link>
  );
}
