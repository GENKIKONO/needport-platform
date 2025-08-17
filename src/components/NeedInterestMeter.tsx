interface NeedInterestMeterProps {
  buyCount: number;
  maybeCount: number;
  interestCount: number;
  totalCount: number;
}

export default function NeedInterestMeter({ 
  buyCount, 
  maybeCount, 
  interestCount, 
  totalCount 
}: NeedInterestMeterProps) {
  const blocks = Array.from({ length: 10 }, (_, i) => {
    if (i < buyCount) return 'buy';
    if (i < buyCount + maybeCount) return 'maybe';
    if (i < buyCount + maybeCount + interestCount) return 'interest';
    return 'empty';
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">関心度メーター</h3>
      
      {/* Interest blocks */}
      <div className="flex gap-1">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`flex-1 h-8 rounded ${
              block === 'buy' ? 'bg-blue-600' :
              block === 'maybe' ? 'bg-blue-400' :
              block === 'interest' ? 'bg-blue-200' :
              'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>購入したい ({buyCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>欲しいかも ({maybeCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span>興味あり ({interestCount})</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{totalCount}人</div>
          <div className="text-xs">総関心者</div>
        </div>
      </div>
    </div>
  );
}
