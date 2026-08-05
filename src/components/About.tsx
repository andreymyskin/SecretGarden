export function About() {
  return (
    <section id="about" className="section">
      <div className="section-inner grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-eyebrow">О компании</p>
          <h2 className="section-title">Сад, спрятанный от шума города</h2>
          <p className="section-lead">
            Secret Garden — камерное фотопространство с мягким естественным
            светом, живой зеленью и пастельными декорациями. Мы создаём место,
            где кадр получается спокойным, тёплым и настоящим.
          </p>
          <p className="mt-5 max-w-xl text-[var(--muted)]">
            Здесь снимают портреты, love story, брендовый контент и семейные
            истории. Команда помогает с постановкой света, подбором локации и
            атмосферой съёмки — от первого кадра до финального кадра.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src="/uploads/morning-orangery.svg"
            alt="Интерьер Secret Garden"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(47,61,54,0.55)] to-transparent p-6 text-white">
            <p className="font-[family-name:var(--font-display)] text-2xl">С 2019 года</p>
            <p className="mt-1 text-sm text-white/85">
              бережно собираем сад для красивых историй
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
