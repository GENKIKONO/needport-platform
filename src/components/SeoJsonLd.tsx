interface SeoJsonLdProps {
  type: "home" | "need";
  needData?: {
    id: string;
    title: string;
    summary?: string;
    adopted_offer_id?: string | null;
    price_amount?: number | null;
    vendor_name?: string | null;
  };
}

export default function SeoJsonLd({ type, needData }: SeoJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const currentUrl = needData ? `${siteUrl}/needs/${needData.id}` : siteUrl;

  const baseStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Organization
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NeedPort",
        url: siteUrl,
        description: "ニーズ募集・オファー比較プラットフォーム",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icons/icon-512.png`,
          width: 512,
          height: 512
        },
        sameAs: [
          "https://twitter.com/needport",
          "https://github.com/needport"
        ]
      },
      // WebSite
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "NeedPort",
        description: "ニーズ募集・オファー比較プラットフォーム",
        publisher: {
          "@id": `${siteUrl}/#organization`
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  // Add Product-like Offer for adopted needs
  if (type === "need" && needData && needData.adopted_offer_id && needData.price_amount) {
    const offerData = {
      "@type": "Offer",
      "@id": `${currentUrl}#offer`,
      url: currentUrl,
      name: needData.title,
      description: needData.summary || "",
      price: needData.price_amount,
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: needData.vendor_name || "Unknown Vendor"
      },
      itemOffered: {
        "@type": "Service",
        name: needData.title,
        description: needData.summary || ""
      }
    };

    baseStructuredData["@graph"].push(offerData);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(baseStructuredData, null, 2)
      }}
    />
  );
}
