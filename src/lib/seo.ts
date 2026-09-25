import { site } from "@/content/site";

const DEFAULT_SITE_URL = "https://secretgarden62.ru";

/** Public origin of the site, used for canonical URLs, Open Graph, sitemap and JSON-LD. */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(raw || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, getSiteUrl()).toString();
}

export const seo = {
  title: "Фотостудия Secret Garden («Тайный Сад») в Рязани — аренда винтажной фотостудии",
  shortTitle: "Фотостудия Secret Garden — Тайный Сад, Рязань",
  description:
    "Винтажная фотостудия Secret Garden («Тайный Сад») в историческом здании 1910-х годов в центре Рязани: две комнаты, старинный рояль 1930 года, кирпичный коридор с арками, гардероб в аренду, профессиональный свет и дым-машина. Аренда от 2500 ₽ в час, фотопроекты под ключ.",
  keywords: [
    "фотостудия Рязань",
    "аренда фотостудии Рязань",
    "винтажная фотостудия",
    "фотостудия с роялем",
    "фотостудия Тайный Сад",
    "Secret Garden Рязань",
    "фотосессия Рязань",
    "интерьерная фотостудия",
    "фотопроекты под ключ",
    "аренда платьев для фотосессии Рязань",
  ],
  ogImage: { url: "/og-cover.jpg", width: 1200, height: 630, alt: `${site.fullName} — интерьер с роялем` },
};

/** Serialises JSON-LD safely for inline `<script>` output. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
