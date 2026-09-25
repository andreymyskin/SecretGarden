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

  return (
    <>
      <StructuredData content={content} />
      <Header links={links} />
      <main>
        <Hero photos={content.hero.photos} locationsVisible={show.zones} />
        {show.studio && <Studio photos={content.studio.photos} />}
        {show.projects && (
          <Collection
            id="projects"
            eyebrow="Фотопроекты"
            title={texts.projects.title}
            intro={texts.projects.intro}
            emptyText={texts.projects.empty}
            items={content.projects}
            soft
          />
        )}
        {show.zones && (
          <Collection
            id="locations"
            eyebrow="Локации"
            title={texts.zones.title}
            intro={texts.zones.intro}
            emptyText={texts.zones.empty}
            items={content.zones}
          />
        )}
        {show.wardrobe && <Wardrobe photos={content.wardrobe.photos} />}
        {show.equipment && <Equipment items={content.equipment} />}
        {show.light && <Light photos={content.light.photos} />}
        <Price />
        <Rules />
        <Contacts />
      </main>
      <Footer links={links} />
    </>
  );
}
