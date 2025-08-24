'use client';

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function Section({ title, description, children, action, className = '' }: SectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-blue-200 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-blue-900 mb-1">{title}</h2>
          {description && (
            <p className="text-sm text-blue-700">{description}</p>
          )}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
