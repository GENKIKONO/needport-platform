interface LogoProps {
  showText?: boolean;
  className?: string;
}

export default function Logo({ showText = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 船のSVGアイコン */}
      <svg 
        className="h-8 w-8 text-blue-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      
      {/* テキスト（オプション） */}
      {showText && (
        <span className="text-xl font-bold text-gray-900">NeedPort</span>
      )}
    </div>
  );
}
