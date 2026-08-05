const locations = [
  {
    title: "Оранжерея",
    text: "Стеклянный павильон с рассеянным дневным светом и высокими растениями.",
    image: "/uploads/morning-orangery.svg",
  },
  {
    title: "Розовый сад",
    text: "Пастельные цветовые пятна и мягкие текстуры для fashion и beauty.",
    image: "/uploads/rose-garden.svg",
  },
  {
    title: "Секретная беседка",
    text: "Уединённый уголок для камерных портретов и love story.",
    image: "/uploads/secret-gazebo.svg",
  },
];

export function Locations() {
  return (
    <section id="locations" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Локации</p>
        <h2 className="section-title">Три настроения одного сада</h2>
        <p className="section-lead">
          Выбирайте пространство под характер истории — от воздушной оранжереи
          до уютной беседки в зелени.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {locations.map((location) => (
            <article key={location.title} className="group">
              <div className="overflow-hidden rounded-[1.75rem]">
                <img
                  src={location.image}
                  alt={location.title}
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl">
                {location.title}
              </h3>
              <p className="mt-2 text-[var(--muted)]">{location.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
