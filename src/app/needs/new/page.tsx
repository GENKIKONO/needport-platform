import NeedFormWizard from "@/components/needs/NeedFormWizard";

export default function NewNeedPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">ニーズを投稿</h1>
        <p className="text-[var(--c-text-muted)]">
          6つのステップで詳細なニーズを投稿できます
        </p>
      </div>
      <NeedFormWizard />
    </main>
  );
}
