import { site, texts } from "@/content/site";

export function Contacts() {
  const mapSrc = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(site.mapQuery)}&z=16`;

  return (
    <section id="contacts" className="section section-soft">
      <div className="section-inner grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-eyebrow">Контакты</p>
          <h2 className="section-title">{texts.contacts.title}</h2>
          <p className="section-lead">
            Напишите или позвоните — поможем выбрать время, подобрать образ и подготовим студию к вашей съёмке.
          </p>

          <dl className="mt-8 grid gap-5">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose)]">Телефон</dt>
              <dd className="m-0 mt-1 text-lg">
                <a href={site.phoneHref} className="hover:text-[var(--green)]">{site.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose)]">Почта</dt>
              <dd className="m-0 mt-1 text-lg">
                <a href={`mailto:${site.email}`} className="hover:text-[var(--green)]">{site.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--rose)]">Адрес</dt>
              <dd className="m-0 mt-1 text-lg">{site.address}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {site.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                {social.label}
              </a>
            ))}
          </div>

          <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn mt-8">
            Записаться онлайн
          </a>
        </div>

        <div className="card overflow-hidden">
          <iframe
            title="Secret Garden на карте"
            src={mapSrc}
            className="h-[380px] w-full border-0 lg:h-full lg:min-h-[460px]"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
