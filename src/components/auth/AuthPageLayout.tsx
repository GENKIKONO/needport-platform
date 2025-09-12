import { BRAND } from '@/lib/constants/brand';

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
          <p className="text-slate-600 mb-4">{BRAND.TAGLINE}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}