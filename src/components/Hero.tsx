export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden"
      aria-label="Secret Garden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(47,61,54,0.28), rgba(47,61,54,0.08)), url('/uploads/evening-garden.svg') center/cover no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(232,241,236,0.92)] via-[rgba(232,241,236,0.35)] to-transparent" />

      <div
        className="pointer-events-none absolute -left-10 top-28 h-40 w-40 rounded-full bg-[rgba(229,184,180,0.45)] blur-2xl"
        style={{ animation: "float 7s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-8 top-40 h-28 w-28 rounded-full bg-[rgba(197,221,208,0.55)] blur-xl"
        style={{ animation: "drift 9s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute bottom-28 left-[18%] h-24 w-24 rounded-full bg-[rgba(207,223,232,0.5)] blur-xl"
        style={{ animation: "softPulse 5s ease-in-out infinite" }}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-[min(1120px,100%)] flex-col justify-end px-5 pb-16 pt-28 md:pb-24">
        <p className="reveal section-eyebrow text-white/90 drop-shadow-sm">фотопространство</p>
        <h1 className="reveal reveal-delay-1 font-[family-name:var(--font-display)] text-[clamp(3.4rem,12vw,7rem)] leading-[0.92] tracking-[-0.04em] text-[var(--ink)]">
          Secret Garden
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-xl text-lg text-[var(--muted)] md:text-xl">
          Пастельный сад для портретов, историй и тихих съёмок — свет, зелень и
          атмосфера, в которой хочется остаться.
        </p>
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
          <a href="#works" className="btn">
            Смотреть работы
          </a>
          <a href="#contacts" className="btn btn-ghost">
            Забронировать
          </a>
        </div>
      </div>
    </section>
  );
}
