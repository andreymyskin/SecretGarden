import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const updated = new Date(content.updatedAt);
  const lastModified = Number.isNaN(updated.getTime()) ? new Date() : updated;

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/oferta"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
