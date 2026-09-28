import { texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { PhotoGrid } from "../PhotoGrid";

export function Wardrobe({ photos, soft = false }: { photos: Photo[]; soft?: boolean }) {
  return (
    <section id="wardrobe" className={`section ${soft ? "section-soft" : ""}`}>
      <div className="section-inner">
        <p className="section-eyebrow">Гардероб</p>
        <h2 className="section-title">{texts.wardrobe.title}</h2>
        <p className="section-lead">{texts.wardrobe.intro}</p>
        <PhotoGrid photos={photos} title="Гардероб" variant="grid" />
      </div>
    </section>
  );
}
