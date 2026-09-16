import Link from "next/link";
import { texts } from "@/content/site";

export function Rules() {
  return (
    <section id="rules" className="section">
      <div className="section-inner">
        <p className="section-eyebrow">Правила</p>
        <h2 className="section-title">{texts.rules.title}</h2>
        <p className="section-lead">{texts.rules.intro}</p>

        <ol className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-2">
          {texts.rules.items.map((rule, index) => (
            <li key={rule.title} className="card flex gap-5 p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--pink)] font-[family-name:var(--font-display)] text-lg text-[var(--green)]">
                {index + 1}
              </span>
              <div>
                <h3 className="m-0 text-lg font-semibold text-[var(--ink)]">{rule.title}</h3>
                <p className="mt-1.5 text-[var(--muted)]">{rule.text}</p>
                {rule.link ? (
                  <Link href={rule.link.href} className="mt-2 inline-block font-semibold text-[var(--rose)] hover:underline">
                    {rule.link.label} →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
