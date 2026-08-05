import { About } from "@/components/About";
import { Contacts } from "@/components/Contacts";
import { Equipment } from "@/components/Equipment";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Locations } from "@/components/Locations";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Locations />
        <Equipment />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
