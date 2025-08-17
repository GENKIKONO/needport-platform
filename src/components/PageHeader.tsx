interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      {badge && (
        <span className="np-badge bg-blue-100 text-blue-800 mb-3 inline-block">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
