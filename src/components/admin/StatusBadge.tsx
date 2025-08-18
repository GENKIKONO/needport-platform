import { type Stage, type PaymentStatus } from "@/lib/admin/types";

const stageColors = {
  posted: "bg-blue-100 text-blue-800 border-blue-200",
  gathering: "bg-yellow-100 text-yellow-800 border-yellow-200",
  proposed: "bg-orange-100 text-orange-800 border-orange-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  room: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  disputed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-pink-100 text-pink-800 border-pink-200",
};

const paymentColors = {
  none: "bg-gray-100 text-gray-800 border-gray-200",
  escrow_hold: "bg-yellow-100 text-yellow-800 border-yellow-200",
  released: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-red-100 text-red-800 border-red-200",
};

const stageLabels = {
  posted: "投稿",
  gathering: "賛同集め",
  proposed: "提案受領",
  approved: "承認済み",
  room: "ルーム進行中",
  in_progress: "作業実行中",
  completed: "完了",
  disputed: "異議",
  refunded: "返金",
};

const paymentLabels = {
  none: "未決済",
  escrow_hold: "保留中",
  released: "支払い済み",
  refunded: "返金済み",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stageColors[stage]}`}>
      {stageLabels[stage]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${paymentColors[status]}`}>
      {paymentLabels[status]}
    </span>
  );
}
