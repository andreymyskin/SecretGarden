import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Contacts } from "@/components/sections/Contacts";
import { Equipment } from "@/components/sections/Equipment";
import { Light } from "@/components/sections/Light";
import { Price } from "@/components/sections/Price";
import { Rules } from "@/components/sections/Rules";
import { Studio } from "@/components/sections/Studio";
import { Wardrobe } from "@/components/sections/Wardrobe";
import { Zones } from "@/components/sections/Zones";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getContent();

  return (
    <>
      <Header />
      <main>
        <Studio photos={content.studio.photos} />
        <Zones zones={content.zones} />
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
