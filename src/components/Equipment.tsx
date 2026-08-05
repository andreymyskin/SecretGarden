const equipment = [
  {
    title: "Свет",
    items: [
      "Godox AD600 Pro и импульсные головки",
      "Постоянный LED-свет с софтбоксами",
      "Отражатели и флаги для мягкой тени",
    ],
  },
  {
    title: "Фон и декор",
    items: [
      "Пастельные бумажные фоны",
      "Живые растения и сезонные букеты",
      "Винтажная мебель и текстиль",
    ],
  },
  {
    title: "Техника",
    items: [
      "Штативы Manfrotto и C-stands",
      "Беспроводные триггеры",
      "Монитор для клиентского просмотра",
    ],
  },
];

export function Equipment() {
  return (
    <section id="equipment" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Оборудование</p>
        <h2 className="section-title">Всё для аккуратного кадра</h2>
        <p className="section-lead">
          Студия готова к работе «под ключ»: свет, декор и техника, которые не
          отвлекают от съёмки.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {equipment.map((block) => (
            <div
              key={block.title}
              className="rounded-[1.75rem] bg-[rgba(255,255,255,0.45)] p-7 backdrop-blur-sm"
            >
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--sage-deep)]">
                {block.title}
              </h3>
              <ul className="mt-5 space-y-3 text-[var(--muted)]">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blush)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
