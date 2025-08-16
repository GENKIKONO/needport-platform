import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default function NotFound() {
  return (
    <div style={{padding:24}}>
      <h1>ページが見つかりません</h1>
      <a href="/">トップへ</a>
    </div>
  );
}
