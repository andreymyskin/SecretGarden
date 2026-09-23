import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Collection } from "@/components/sections/Collection";
import { Contacts } from "@/components/sections/Contacts";
import { Equipment } from "@/components/sections/Equipment";
import { Light } from "@/components/sections/Light";
import { Price } from "@/components/sections/Price";
import { Rules } from "@/components/sections/Rules";
import { Studio } from "@/components/sections/Studio";
import { Wardrobe } from "@/components/sections/Wardrobe";
import { texts } from "@/content/site";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContent();

  return (
    <>
      <Header />
      <main>
        <Studio heroPhotos={content.hero.photos} photos={content.studio.photos} />
        <Collection
          id="projects"
          eyebrow="Фотопроекты"
          title={texts.projects.title}
          intro={texts.projects.intro}
          emptyText={texts.projects.empty}
          items={content.projects}
          soft
        />
        <Collection
          id="locations"
          eyebrow="Локации"
          title={texts.zones.title}
          intro={texts.zones.intro}
          emptyText={texts.zones.empty}
          items={content.zones}
        />
        <Wardrobe photos={content.wardrobe.photos} />
        <Equipment items={content.equipment} />
        <Light photos={content.light.photos} />
        <Price />
        <Rules />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
