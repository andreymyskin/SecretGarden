import { texts } from "@/content/site";
import type { EquipmentItem } from "@/lib/types";

export function Equipment({ items }: { items: EquipmentItem[] }) {
  return (
    <section id="equipment" className="section section-soft">
      <div className="section-inner">
        <p className="section-eyebrow">Оборудование</p>
        <h2 className="section-title">{texts.equipment.title}</h2>
        <p className="section-lead">{texts.equipment.intro}</p>

        {items.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">Список оборудования скоро появится.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="card flex flex-col overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-[var(--pink)]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
