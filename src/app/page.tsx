import { Fragment, type ReactNode } from "react";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Collection } from "@/components/sections/Collection";
import { Contacts } from "@/components/sections/Contacts";
import { Equipment } from "@/components/sections/Equipment";
import { Hero } from "@/components/sections/Hero";
import { Light } from "@/components/sections/Light";
import { Price } from "@/components/sections/Price";
import { Rules } from "@/components/sections/Rules";
import { Studio } from "@/components/sections/Studio";
import { Wardrobe } from "@/components/sections/Wardrobe";
import { StructuredData } from "@/components/StructuredData";
import { texts, visibleNav } from "@/content/site";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContent();
  const show = content.sections;
  const links = visibleNav(show);

  // Published blocks in page order; every second one gets the soft pink tint so the
  // rhythm white → tint → white survives whatever the admin has hidden.
  const blocks: { key: string; render: (soft: boolean) => ReactNode }[] = [];
  if (show.studio) {
    blocks.push({ key: "studio", render: (soft) => <Studio photos={content.studio.photos} soft={soft} /> });
  }
  if (show.projects) {
    blocks.push({
      key: "projects",
      render: (soft) => (
        <Collection
          id="projects"
          eyebrow="Фотопроекты"
          title={texts.projects.title}
          intro={texts.projects.intro}
          emptyText={texts.projects.empty}
          items={content.projects}
          soft={soft}
        />
      ),
    });
  }
  if (show.zones) {
    blocks.push({
      key: "zones",
      render: (soft) => (
        <Collection
          id="locations"
          eyebrow="Локации"
          title={texts.zones.title}
          intro={texts.zones.intro}
          emptyText={texts.zones.empty}
          items={content.zones}
          soft={soft}
        />
      ),
    });
  }
  if (show.wardrobe) {
    blocks.push({ key: "wardrobe", render: (soft) => <Wardrobe photos={content.wardrobe.photos} soft={soft} /> });
  }
  if (show.equipment) {
    blocks.push({ key: "equipment", render: (soft) => <Equipment items={content.equipment} soft={soft} /> });
  }
  if (show.light) {
    blocks.push({ key: "light", render: (soft) => <Light photos={content.light.photos} soft={soft} /> });
  }
  blocks.push({ key: "price", render: (soft) => <Price soft={soft} /> });
  blocks.push({ key: "rules", render: (soft) => <Rules soft={soft} /> });
  blocks.push({ key: "contacts", render: (soft) => <Contacts soft={soft} /> });

  return (
    <>
      <StructuredData content={content} />
      <Header links={links} />
      <main>
        <Hero photos={content.hero.photos} locationsVisible={show.zones} />
        {blocks.map((block, index) => (
          <Fragment key={block.key}>{block.render(index % 2 === 1)}</Fragment>
        ))}
      </main>
      <Footer links={links} />
      <BackToTop />
    </>
  );
}
