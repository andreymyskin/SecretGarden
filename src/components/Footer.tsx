export function Footer() {
  return (
    <footer className="border-t border-[rgba(95,138,112,0.18)] px-5 py-10">
      <div className="mx-auto flex w-[min(1120px,100%)] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl">
            Secret Garden
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Пастельное фотопространство для тихих историй
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <a href="#about" className="hover:text-[var(--ink)]">
            О компании
          </a>
          <a href="#works" className="hover:text-[var(--ink)]">
            Работы
          </a>
          <a href="/admin" className="hover:text-[var(--ink)]">
            Админ
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
