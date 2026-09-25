import Link from "next/link";
import { nav, site, type NavLink } from "@/content/site";

export function Footer({ links = nav }: { links?: NavLink[] }) {
  return (
    <footer className="border-t border-[var(--pink-line)] bg-white px-5 py-12">
      <div className="mx-auto grid w-[min(1140px,100%)] gap-10 md:grid-cols-[1fr_auto_auto]">
        <div>
          <img src="/brand/logo-green.png" alt="Secret Garden Photostudio" className="h-16 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-[var(--muted)]">
            {site.fullName}. Винтажная фотостудия в старинном здании Рязани.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          {links.map((link) => (
            <a key={link.href} href={`/${link.href}`} className="text-[var(--muted)] hover:text-[var(--green)]">
              {link.label}
            </a>
          ))}
          <Link href="/oferta" className="text-[var(--muted)] hover:text-[var(--green)]">
            Договор оферты
          </Link>
          <Link href="/privacy" className="text-[var(--muted)] hover:text-[var(--green)]">
            Политика конфиденциальности
          </Link>
          <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--green)]">
            Админ
          </Link>
        </div>

        <div className="text-sm text-[var(--muted)]">
          <a href={site.phoneHref} className="block hover:text-[var(--green)]">{site.phone}</a>
          <a href={`mailto:${site.email}`} className="block hover:text-[var(--green)]">{site.email}</a>
          <p className="mt-3">{site.address}</p>
          <div className="mt-3 flex gap-3">
            {site.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--pink-deep)] text-xs font-bold text-[var(--green)] hover:bg-[var(--pink)]"
              >
                {social.short}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-[min(1140px,100%)] flex-wrap justify-between gap-2 border-t border-[var(--pink-line)] pt-6 text-xs text-[var(--muted)]">
        <span>© {new Date().getFullYear()} {site.name}. All Rights Reserved.</span>
        <span>ИНН {site.inn}</span>
      </div>
    </footer>
  );
}
