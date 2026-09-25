import { site, texts } from "@/content/site";
import type { SiteContent } from "@/lib/types";
import { absoluteUrl, jsonLd, seo } from "@/lib/seo";

/** Schema.org LocalBusiness + WebSite markup for the landing page (read by Google and Yandex). */
export function StructuredData({ content }: { content: SiteContent }) {
  const url = absoluteUrl("/");
  const galleryImages = [
    ...content.hero.photos,
    ...content.studio.photos.slice(0, 6),
    ...content.zones.map((zone) => ({ url: zone.cover })),
  ]
    .map((photo) => absoluteUrl(photo.url))
    .filter((value, index, list) => list.indexOf(value) === index);

  const business = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#business`,
    name: site.fullName,
    alternateName: ["Secret Garden", "Тайный Сад", "Фотостудия Secret Garden Рязань"],
    description: seo.description,
    url,
    image: [absoluteUrl(seo.ogImage.url), ...galleryImages],
    logo: absoluteUrl("/brand/logo-green.png"),
    telephone: site.phone.replace(/\s+/g, ""),
    email: site.email,
    priceRange: "2500 ₽/час",
    currenciesAccepted: "RUB",
    paymentAccepted: "Банковская карта, онлайн-оплата",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Краснорядская улица, 19",
      addressLocality: "Рязань",
      addressRegion: "Рязанская область",
      addressCountry: "RU",
    },
    areaServed: { "@type": "City", name: "Рязань" },
    sameAs: site.socials.map((social) => social.href),
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: site.bookingUrl, actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"] },
      result: { "@type": "Reservation", name: "Бронирование фотостудии" },
    },
    makesOffer: texts.price.groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Offer",
        name: item.name,
        description: item.note,
        price: item.price.replace(/[^\d–-]/g, "").split(/[–-]/)[0],
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: site.bookingUrl,
      })),
    ),
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Старинный рояль 1930 года", value: true },
      { "@type": "LocationFeatureSpecification", name: "Гримёрная", value: true },
      { "@type": "LocationFeatureSpecification", name: "Дым-машина", value: true },
      { "@type": "LocationFeatureSpecification", name: "Осветительное оборудование", value: true },
      { "@type": "LocationFeatureSpecification", name: "Гардероб в аренду", value: true },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url,
    name: site.fullName,
    inLanguage: "ru-RU",
    publisher: { "@id": `${url}#business` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(business) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(website) }} />
    </>
  );
}
