import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://needport.jp";
  
  // 静的ページ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/needs`,
      lastModified: new Date(),
    },
  ];

  // 動的ページ（公開中のニーズ）
  try {
    const res = await fetch(`${baseUrl}/api/needs?page=1&pageSize=100`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });
    
    if (res.ok) {
      const data = await res.json();
      const needPages = data.items.map((need: any) => ({
        url: `${baseUrl}/needs/${need.id}`,
        lastModified: new Date(need.updatedAt),
      }));
      
      return [...staticPages, ...needPages];
    }
  } catch (error) {
    console.error('Failed to fetch needs for sitemap:', error);
  }

  return staticPages;
}
