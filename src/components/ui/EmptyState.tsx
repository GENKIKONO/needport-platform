interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      {action && (
        <a
          href={action.href}
          className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
