// サーバー側の「ページ」：ここではクライアントを描画するだけ
export const dynamic = "force-dynamic";
export const revalidate = 0;

import PayoutsClient from './PayoutsClient';

export default function Page() {
  return <PayoutsClient />;
}
