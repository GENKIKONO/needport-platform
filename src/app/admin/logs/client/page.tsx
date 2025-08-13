import { supabaseServer } from "@/lib/server/supabase";
import AdminBar from "@/components/admin/AdminBar";

export const dynamic = "force-dynamic";

interface ClientError {
  id: string;
  at: string;
  name: string;
  message: string;
  stack: string;
  path: string;
  ua: string;
  ip: string;
}

export default async function ClientErrorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const sp = await searchParams;
    const page = Math.max(1, Number(sp.page) || 1);
    const per = Math.min(100, Math.max(1, Number(sp.per) || 50));
    const offset = (page - 1) * per;
    const search = sp.search as string | undefined;

    const supabase = supabaseServer();

    // Build query
    let query = supabase
      .from("client_errors")
      .select("*", { count: "exact" });

    // Apply search filter
    if (search?.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,message.ilike.%${search.trim()}%,path.ilike.%${search.trim()}%`);
    }

    // Get total count
    // @ts-expect-error - Supabase type issue, will be fixed when types are updated
    const { count } = await query.select("id", { count: "exact", head: true });

    // Get paginated data
    const { data: errors, error } = await query
      .order("at", { ascending: false })
      .range(offset, offset + per - 1);

    if (error) {
      console.error("Failed to fetch client errors:", error);
      return (
        <div className="p-6 text-red-500">
          エラーログの取得に失敗しました。
          <pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
        </div>
      );
    }

    const totalPages = Math.ceil((count || 0) / per);

    const getPageUrl = (newPage: number) => {
      const params = new URLSearchParams();
      params.set("page", String(newPage));
      params.set("per", String(per));
      if (search) params.set("search", search);
      return `?${params.toString()}`;
    };

    return (
      <div className="space-y-6">
        <AdminBar title="クライアントエラーログ" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">クライアントエラーログ</h1>
            <div className="text-sm text-gray-400">
              合計 {count || 0} 件のエラー
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="エラー名、メッセージ、パスで検索..."
                className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
              />
              <button
                type="submit"
                className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
              >
                検索
              </button>
              {search && (
                <a
                  href="?"
                  className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-3 py-2 text-sm text-gray-200 hover:bg-gray-600/30"
                >
                  クリア
                </a>
              )}
            </form>
          </div>

          {/* Errors List */}
          {errors && errors.length > 0 ? (
            <div className="space-y-4">
              {errors.map((error: ClientError) => (
                <div key={error.id} className="rounded-lg border border-red-500/20 bg-red-600/10 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-red-300">{error.name}</h3>
                      <p className="text-sm text-red-200 mt-1">{error.message}</p>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {new Date(error.at).toLocaleString("ja-JP")}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300 mt-3">
                    <div>
                      <span className="font-medium">パス:</span> {error.path}
                    </div>
                    <div>
                      <span className="font-medium">IP:</span> {error.ip}
                    </div>
                    <div>
                      <span className="font-medium">User Agent:</span> {error.ua.substring(0, 50)}...
                    </div>
                  </div>
                  
                  {error.stack && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                        スタックトレースを表示
                      </summary>
                      <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap bg-black/20 p-2 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {search ? "検索条件に一致するエラーがありません" : "エラーログがありません"}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {page > 1 && (
                <a
                  href={getPageUrl(page - 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  前へ
                </a>
              )}
              <span className="text-sm text-gray-400">
                ページ {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={getPageUrl(page + 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  次へ
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in client errors page:", error);
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{String(error)}</pre>
      </div>
    );
  }
}
