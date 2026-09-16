import { site, texts } from "@/content/site";

export function Price() {
  return (
    <section id="price" className="section section-soft">
      <div className="section-inner">
        <p className="section-eyebrow">Стоимость</p>
        <h2 className="section-title">{texts.price.title}</h2>
        <p className="section-lead">{texts.price.intro}</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {texts.price.groups.map((group) => (
            <div key={group.title} className="card p-7">
              <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
                {group.title}
              </h3>
              <ul className="m-0 mt-5 list-none space-y-5 p-0">
                {group.items.map((item) => (
                  <li key={item.name} className="border-t border-[var(--pink-line)] pt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="m-0 font-semibold text-[var(--ink)]">{item.name}</p>
                      <p className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--rose)]">
                        {item.price}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--pink-line)] bg-white px-7 py-6">
          <p className="m-0 font-[family-name:var(--font-display)] text-xl text-[var(--green)]">
            {texts.contacts.cta}
          </p>
          <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-rose">
            Записаться
          </a>
        </div>
      </div>
    </section>
  );
}
