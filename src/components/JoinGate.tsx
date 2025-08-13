'use client';

interface JoinGateProps {
  className?: string;
}

export default function JoinGate({ className = '' }: JoinGateProps) {
  const handleClick = () => {
    console.log('join_gate_open');
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-blue-800 font-medium">
            会員登録（今だけ¥0）で全文・添付・参加OK
          </p>
        </div>
        <button
          onClick={handleClick}
          className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors min-h-[44px] min-w-[44px]"
        >
          登録する
        </button>
      </div>
    </div>
  );
}
