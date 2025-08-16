export default function NeedApprovalNote() {
  if (process.env.NEXT_PUBLIC_REQUIRE_APPROVAL !== '1') return null;
  
  return (
    <p className="text-xs text-gray-500 mt-2">
      このプラットフォームでは、新しいプロジェクトは公開前に審査されます（デモ運用）。
    </p>
  );
}
