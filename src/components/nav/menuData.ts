import type { CmsTag } from "@/lib/cms/types";
import { readCms } from "@/lib/cms/storage";

export type MenuItem = { label: string; href: string; icon?: any; tag?: CmsTag };
export type MenuGroup = { title: string; items: MenuItem[]; tag?: CmsTag };

export async function getMenuData(): Promise<MenuGroup[]> {
  const cms = await readCms();
  // 既存の固定データをCMSで上書き（tag==="cms" のもの）
  const groups = cms.navigation.groups.map((g) => ({
    title: g.title,
    items: g.items.map((it) => ({ label: it.label, href: it.href, tag: "cms" as const })),
    tag: "cms" as const
  }));
  return groups;
}
