import { texts } from "@/content/site";
import type { Photo } from "@/lib/types";
import { PhotoStrip } from "../PhotoStrip";

export function Studio({ photos }: { photos: Photo[] }) {
  return (
    <section id="studio" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Студия</p>
        <h2 className="section-title">Атмосфера, в которой оживает история</h2>
        <p className="section-lead">{texts.studio.intro}</p>
        <PhotoStrip photos={photos} title="Студия" />
      </div>
    </section>
  );
}
