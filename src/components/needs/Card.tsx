import Link from 'next/link';

export default function NeedCard({ item }: { item: any }) {
  const masked = (s: string) => s?.replace(/[0-9A-Za-z._%+-]+@[0-9A-Za-z.-]+/g, '***')
                                 ?.replace(/[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}/g, '***');
  return (
    <div className="border rounded p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">{item.title ?? '無題'}</h3>
        <span className="text-xs text-muted-foreground">{new Date(item.updated_at ?? item.created_at).toLocaleDateString()}</span>
      </div>
      <div className="text-sm text-muted-foreground line-clamp-2">{masked(item.summary ?? '')}</div>
      <div className="text-xs flex gap-2 text-muted-foreground">
        {item.region && <span>📍{item.region}</span>}
        {item.category && <span># {item.category}</span>}
      </div>
      <div className="flex gap-2 mt-1">
        <Link href={`/needs/${item.id}`} className="rounded bg-slate-900 text-white text-sm px-3 py-1">詳細を見る</Link>
      </div>
    </div>
  );
}
