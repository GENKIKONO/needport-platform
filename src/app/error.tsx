'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{padding:24}}>
      <h1>エラーが発生しました</h1>
      <button onClick={() => reset()}>再読み込み</button>
      <a href="/" style={{marginLeft:12}}>トップへ戻る</a>
    </div>
  );
}
