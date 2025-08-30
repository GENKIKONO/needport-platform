'use client';

export default function NeedsError({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 text-sm">
      エラーが発生しました。<button className="link" onClick={reset}>再読み込み</button>
    </div>
  );
}
