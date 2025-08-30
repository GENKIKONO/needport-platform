// サーバー側の「ページ」：ここではクライアントを描画するだけ
// （dynamic/revalidate はサーバーファイル側に置く）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ProposalNewClient from './ProposalNewClient';

export default function Page() {
  return <ProposalNewClient />;
}
