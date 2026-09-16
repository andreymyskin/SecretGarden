"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";

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
          ? "border-b border-[var(--pink-line)] bg-white/92 shadow-[0_10px_30px_rgba(43,47,44,0.05)] backdrop-blur-xl"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex w-[min(1140px,100%)] items-center justify-between gap-4 px-5 py-3">
        <Link href="/#studio" className="flex items-center gap-3" aria-label="Secret Garden — на главную">
          <img
            src="/brand/logo-green.png"
            alt="Secret Garden Photostudio"
            className="h-11 w-auto md:h-12"
            width={744}
            height={619}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((link) => (
            <a
              key={link.href}
              href={`/${link.href}`}
              className="relative text-[0.92rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--green)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--rose)] after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
          <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
            Записаться
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--pink-deep)] bg-white lg:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex w-5 flex-col gap-1.5">
            <span className={`h-0.5 rounded bg-[var(--green)] transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 rounded bg-[var(--green)] transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 rounded bg-[var(--green)] transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--pink-line)] bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto flex w-[min(1140px,100%)] flex-col gap-2">
            {nav.map((link) => (
              <a
                key={link.href}
                href={`/${link.href}`}
                className="py-2 text-base font-medium text-[var(--ink)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-2 w-fit"
              onClick={() => setOpen(false)}
            >
              Записаться
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
