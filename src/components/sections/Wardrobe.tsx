import { texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { PhotoGrid } from "../PhotoGrid";

export function Wardrobe({ photos }: { photos: Photo[] }) {
  return (
    <section id="wardrobe" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Гардероб</p>
        <h2 className="section-title">{texts.wardrobe.title}</h2>
        <p className="section-lead">{texts.wardrobe.intro}</p>
        <PhotoGrid photos={photos} title="Гардероб" variant="grid" />
      </div>
    </section>
  );
}
