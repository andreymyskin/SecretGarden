"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#about", label: "О компании" },
  { href: "#works", label: "Наши работы" },
  { href: "#locations", label: "Локации" },
  { href: "#equipment", label: "Оборудование" },
  { href: "#contacts", label: "Контакты" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-[rgba(238,246,241,0.88)] shadow-[0_10px_30px_rgba(47,61,54,0.06)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-[min(1120px,100%)] items-center justify-between px-5 py-4">
        <a href="#top" className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          Secret Garden
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--sage-deep)] after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <a href="/admin" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
            Админ
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(95,138,112,0.25)] bg-white/50 md:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Меню</span>
          <span className="flex w-5 flex-col gap-1.5">
            <span className={`h-0.5 rounded bg-[var(--ink)] transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 rounded bg-[var(--ink)] transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 rounded bg-[var(--ink)] transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-[rgba(95,138,112,0.15)] bg-[rgba(238,246,241,0.96)] px-5 py-4 md:hidden">
          <div className="mx-auto flex w-[min(1120px,100%)] flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 text-base font-medium text-[var(--ink)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="/admin" className="btn mt-2 w-fit" onClick={() => setOpen(false)}>
              Админ
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
