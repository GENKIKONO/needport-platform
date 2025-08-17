import Link from "next/link";

export default function CTAbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-4 py-3">
      <div className="container flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          <strong>NeedPort</strong> で安全な取引を
        </div>
        <Link 
          href="/post" 
          className="btn btn-primary h-9 px-6 text-sm"
        >
          無料ではじめる
        </Link>
      </div>
    </div>
  );
}
