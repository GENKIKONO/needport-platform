export default function Empty({
  icon, 
  title, 
  desc, 
  action
}: {
  icon?: React.ReactNode; 
  title: string; 
  desc?: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-[var(--c-blue-bg)] text-[var(--c-blue)]">
        {icon ?? "🫧"}
      </div>
      <h3 className="text-base font-semibold text-[var(--c-text)]">{title}</h3>
      {desc && <p className="mt-2 text-sm text-[var(--c-text-muted)]">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
