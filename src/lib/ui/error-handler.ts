import { useToast } from "@/components/ui/Toast";

export function useErrorHandler() {
  const toast = useToast();

  const handleError = (error: any, context: string = "操作") => {
    console.error(`${context} error:`, error);
    
    if (error?.status === 401) {
      toast("ログインが必要です。まず投稿を作成してください。", "error");
    } else if (error?.status === 403) {
      toast("この操作を行う権限がありません。", "error");
    } else if (error?.status === 423) {
      toast("管理設定でこの機能が無効になっています。", "error");
    } else if (error?.status === 429) {
      toast("リクエストが多すぎます。しばらく待ってから再試行してください。", "error");
    } else if (error?.status >= 500) {
      toast("サーバーエラーが発生しました。しばらく待ってから再試行してください。", "error");
    } else {
      toast(`${context}に失敗しました。`, "error");
    }
  };

  const handleResponse = async (response: Response, context: string = "操作") => {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      (error as any).status = response.status;
      handleError(error, context);
      return false;
    }
    return true;
  };

  return { handleError, handleResponse };
}
