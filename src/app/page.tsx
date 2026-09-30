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
import { isSectionVisible, type OrderableSection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContent();
  const show = content.sections;
  const links = visibleNav(show, content.sectionOrder);

  const renderers: Record<OrderableSection, (soft: boolean) => ReactNode> = {
    studio: (soft) => <Studio photos={content.studio.photos} soft={soft} />,
    projects: (soft) => (
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
    zones: (soft) => (
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
    wardrobe: (soft) => <Wardrobe photos={content.wardrobe.photos} soft={soft} />,
    equipment: (soft) => <Equipment items={content.equipment} soft={soft} />,
    light: (soft) => <Light photos={content.light.photos} soft={soft} />,
    price: (soft) => <Price soft={soft} />,
  };

  // Published blocks in the admin-chosen order, then the fixed closing blocks; every second
  // one gets the soft pink tint so the rhythm white → tint → white survives any reordering or hiding.
  const blocks: { key: string; render: (soft: boolean) => ReactNode }[] = content.sectionOrder
    .filter((section) => isSectionVisible(show, section))
    .map((section) => ({ key: section, render: renderers[section] }));
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
