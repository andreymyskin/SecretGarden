import { texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { PhotoGrid } from "../PhotoGrid";

export function Light({ photos }: { photos: Photo[] }) {
  return (
    <section id="light" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Свет</p>
        <h2 className="section-title">{texts.light.title}</h2>
        <p className="section-lead">{texts.light.intro}</p>
        <PhotoGrid photos={photos} title="Система освещения" variant="masonry" />
      </div>
    </section>
  );
}
