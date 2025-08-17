import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NeedPort - ニーズの港",
    template: "%s | NeedPort"
  },
  description: "リアルな困りごとと業者の提案を安全に成立させるプラットフォーム",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
