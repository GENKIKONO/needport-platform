export default function PageContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-screen-xl px-4 sm:px-6 ${className}`}>{children}</div>
  );
}
