import { type Stage } from "@/lib/admin/types";

const stages: { key: Stage; label: string }[] = [
  { key: "posted", label: "投稿" },
  { key: "gathering", label: "賛同集め" },
  { key: "proposed", label: "提案受領" },
  { key: "approved", label: "承認済み" },
  { key: "room", label: "ルーム進行中" },
  { key: "in_progress", label: "作業実行中" },
  { key: "completed", label: "完了" },
];

export function StageStepper({ currentStage }: { currentStage: Stage }) {
  const currentIndex = stages.findIndex(s => s.key === currentStage);
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      {stages.map((stage, index) => (
        <div key={stage.key} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            index <= currentIndex 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-600"
          }`}>
            {index + 1}
          </div>
          <span className={`ml-2 text-sm ${
            index <= currentIndex ? "text-blue-600 font-medium" : "text-gray-500"
          }`}>
            {stage.label}
          </span>
          {index < stages.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${
              index < currentIndex ? "bg-blue-600" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
