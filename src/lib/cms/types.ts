export type CmsTag = "fixed" | "cms";

export type CmsBlock = {
  id: string;          // 例: "service.flow"
  tag: CmsTag;         // "cms" なら管理画面で編集可能
  title: string;
  description?: string;
};

export type ServiceOverviewContent = {
  heroTitle: string;
  heroLead: string;
  flow: { title: string; items: string[] }[];
  vendorGuide: { title: string; items: string[] }[];
  faq: { q: string; a: string }[];
};

export type HomeSummaryContent = {
  steps: { title: string; body: string; href?: string }[];
};

export type NavigationContent = {
  groups: { title: string; items: { label: string; href: string }[] }[];
};

export type FooterContent = {
  columns: { title: string; links: { label: string; href: string }[] }[];
  copyright: string;
};

export type CmsData = {
  // 管理対象ブロック一覧（UI用）
  registry: CmsBlock[];

  // 実データ
  serviceOverview: ServiceOverviewContent;
  homeSummary: HomeSummaryContent;
  navigation: NavigationContent;
  footer: FooterContent;
};
