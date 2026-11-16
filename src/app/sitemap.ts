import type { MetadataRoute } from "next";
import { getBlogIndexData } from "@/lib/notion";
import { siteUrl } from "@/lib/site";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { subpages } = await getBlogIndexData();

    return [
        { url: `${siteUrl}/` },
        { url: `${siteUrl}/blog` },
        ...subpages.map((post) => ({ url: `${siteUrl}${post.href}` })),
    ];
}
