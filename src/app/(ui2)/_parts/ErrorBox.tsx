export default function ErrorBox({ title="読み込みに失敗しました", detail }: { title?: string; detail?: string }) {
  return (
    <div role="alert" className="p-4 rounded border border-red-200 bg-red-50 text-red-800">
      <div className="font-semibold">{title}</div>
      {detail && <div className="text-sm mt-1">{detail}</div>}
    </div>
  );
}
