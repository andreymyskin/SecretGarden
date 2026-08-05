"use client";

export function Contacts() {
  return (
    <section id="contacts" className="section">
      <div className="section-inner grid gap-10 md:grid-cols-[1fr_0.9fr] md:items-end">
        <div>
          <p className="section-eyebrow">Контакты</p>
          <h2 className="section-title">Загляните в сад</h2>
          <p className="section-lead">
            Напишите нам — подскажем свободные слоты, поможем выбрать локацию и
            подготовим пространство к вашей съёмке.
          </p>

          <div className="mt-8 space-y-4 text-[var(--ink)]">
            <p>
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Адрес
              </span>
              Москва, ул. Садовая, 12, павильон B
            </p>
            <p>
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Телефон
              </span>
              <a href="tel:+74951234567" className="hover:text-[var(--sage-deep)]">
                +7 (495) 123-45-67
              </a>
            </p>
            <p>
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Почта
              </span>
              <a
                href="mailto:hello@secretgarden.studio"
                className="hover:text-[var(--sage-deep)]"
              >
                hello@secretgarden.studio
              </a>
            </p>
            <p>
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Часы работы
              </span>
              Ежедневно, 10:00–22:00
            </p>
          </div>
        </div>

        <form
          className="rounded-[2rem] bg-[rgba(255,255,255,0.55)] p-7 backdrop-blur-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const name = String(data.get("name") || "").trim();
            const phone = String(data.get("phone") || "").trim();
            const message = String(data.get("message") || "").trim();
            const subject = encodeURIComponent("Заявка Secret Garden");
            const body = encodeURIComponent(
              `Имя: ${name}\nТелефон: ${phone}\n\n${message}`,
            );
            window.location.href = `mailto:hello@secretgarden.studio?subject=${subject}&body=${body}`;
          }}
        >
          <div className="space-y-4">
            <div className="field">
              <label htmlFor="name">Имя</label>
              <input id="name" name="name" required placeholder="Как к вам обращаться" />
            </div>
            <div className="field">
              <label htmlFor="phone">Телефон</label>
              <input id="phone" name="phone" required placeholder="+7" />
            </div>
            <div className="field">
              <label htmlFor="message">Сообщение</label>
              <textarea
                id="message"
                name="message"
                placeholder="Дата, формат съёмки, пожелания"
              />
            </div>
            <button type="submit" className="btn w-full">
              Отправить заявку
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
