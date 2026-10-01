import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.fullName,
    short_name: site.name,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    lang: "ru",
    background_color: "#ffffff",
    theme_color: "#2f5a3f",
    icons: [{ src: "/favicon.png", sizes: "any", type: "image/png" }],
  };
}
