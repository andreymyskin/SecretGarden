"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { isToggleableSection, type SiteContent, type ToggleableSection } from "@/lib/types";
import { adminApi } from "./admin/api";
import { CollectionManager, type CollectionLabels } from "./admin/CollectionManager";
import { EquipmentManager } from "./admin/EquipmentManager";
import { PhotoManager } from "./admin/PhotoManager";
import { SectionsManager } from "./admin/SectionsManager";
import { SecurityManager } from "./admin/SecurityManager";

type Tab = ToggleableSection | "hero" | "sections" | "security";

const tabs: { id: Tab; label: string }[] = [
  { id: "hero", label: "Шапка" },
  { id: "studio", label: "Студия" },
  { id: "projects", label: "Фотопроекты" },
  { id: "zones", label: "Локации" },
  { id: "wardrobe", label: "Гардероб" },
  { id: "equipment", label: "Оборудование" },
  { id: "light", label: "Свет" },
  { id: "sections", label: "Разделы" },
  { id: "security", label: "Безопасность" },
];

const zoneLabels: CollectionLabels = {
  newTitle: "Новая локация",
  addButton: "Добавить локацию",
  created: "Локация добавлена",
  updated: "Локация обновлена",
  deleted: "Локация удалена",
  confirmDelete: (title) => `Удалить локацию «${title}» вместе с её фотографиями?`,
  emptyText: "Локаций пока нет.",
  titlePlaceholder: "Например, Старинный рояль",
};

const projectLabels: CollectionLabels = {
  newTitle: "Новый фотопроект",
  addButton: "Добавить фотопроект",
  created: "Фотопроект добавлен",
  updated: "Фотопроект обновлён",
  deleted: "Фотопроект удалён",
  confirmDelete: (title) => `Удалить фотопроект «${title}» вместе с его фотографиями?`,
  emptyText: "Фотопроектов пока нет — добавьте первый.",
  titlePlaceholder: "Например, Зимняя сказка",
};

export function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("studio");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const next = await adminApi.content();
    setContent(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await adminApi.me();
        if (cancelled) return;
        setAuthenticated(me.authenticated);
        if (me.authenticated) await refresh();
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminApi.login(password);
      setAuthenticated(true);
      setPassword("");
      await refresh();
      setMessage("Вы вошли в админ-панель");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    setBusy(true);
    try {
      await adminApi.resetPassword(recoveryCode, password);
      setAuthenticated(true);
      setRecovering(false);
      setRecoveryCode("");
      setPassword("");
      setConfirmPassword("");
      setTab("security");
      await refresh();
      setMessage("Пароль изменён, вы вошли. Создайте новый код восстановления");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сбросить пароль");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await adminApi.logout().catch(() => undefined);
    setAuthenticated(false);
    setContent(null);
    setBusy(false);
  }

  if (checking) {
    return (
      <main className="mx-auto flex min-h-screen w-[min(960px,100%)] items-center justify-center px-5">
        <p className="text-[var(--muted)]">Проверяем доступ…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-[min(460px,100%)] flex-col justify-center px-5 py-16">
        <Link href="/" className="mb-8 text-sm text-[var(--muted)] hover:text-[var(--green)]">
          ← На сайт
        </Link>
        <img src="/brand/logo-green.png" alt="Secret Garden" className="h-20 w-auto self-start" />
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl text-[var(--green)]">
          {recovering ? "Восстановление пароля" : "Админ-панель"}
        </h1>
        {recovering ? (
          <>
            <p className="mt-3 text-[var(--muted)]">
              Введите одноразовый код восстановления, созданный в разделе «Безопасность», и задайте новый пароль.
            </p>
            <form onSubmit={handleReset} className="mt-8 space-y-4">
              <div className="field">
                <label htmlFor="recovery-code">Код восстановления</label>
                <input
                  id="recovery-code"
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value)}
                  required
                  autoComplete="one-time-code"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                />
              </div>
              <div className="field">
                <label htmlFor="reset-password">Новый пароль</label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Не менее 8 символов"
                />
              </div>
              <div className="field">
                <label htmlFor="reset-password-confirm">Повторите пароль</label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-[#b56b6c]">{error}</p> : null}
              <button type="submit" className="btn w-full" disabled={busy}>
                {busy ? "Сохраняем…" : "Задать новый пароль и войти"}
              </button>
            </form>
            <button
              type="button"
              className="mt-6 self-start text-sm text-[var(--muted)] hover:text-[var(--green)]"
              onClick={() => {
                setRecovering(false);
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              ← Вернуться ко входу
            </button>
            <p className="mt-6 text-xs text-[var(--muted)]">
              Нет кода? Удалите на сервере файл <code>data/auth.json</code> — пароль вернётся к значению{" "}
              <code>ADMIN_PASSWORD</code>.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-[var(--muted)]">
              Войдите, чтобы управлять фотографиями, публикацией разделов и настройками сайта.
            </p>
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div className="field">
                <label htmlFor="password">Пароль</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Введите пароль администратора"
                />
              </div>
              {error ? <p className="text-sm text-[#b56b6c]">{error}</p> : null}
              <button type="submit" className="btn w-full" disabled={busy}>
                {busy ? "Входим…" : "Войти"}
              </button>
            </form>
            <button
              type="button"
              className="mt-6 self-start text-sm text-[var(--muted)] hover:text-[var(--green)]"
              onClick={() => {
                setRecovering(true);
                setError("");
                setPassword("");
              }}
            >
              Забыли пароль?
            </button>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(1140px,100%)] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/brand/logo-green.png" alt="Secret Garden" className="h-14 w-auto" />
          <div>
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--green)]">
              ← На сайт
            </Link>
            <h1 className="m-0 mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--green)]">
              Управление контентом
            </h1>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout} disabled={busy}>
          Выйти
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`btn btn-sm ${tab === item.id ? "" : "btn-ghost"}`}
            onClick={() => {
              setTab(item.id);
              setError("");
            }}
          >
            {item.label}
            {content && isToggleableSection(item.id) && !content.sections[item.id] ? (
              <span className="ml-1.5 text-[0.7rem] font-semibold uppercase tracking-wide opacity-70" title="Раздел скрыт с сайта">
                скрыт
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {(error || message) && (
        <div
          className={`mt-6 rounded-[1rem] border px-4 py-3 text-sm ${
            error
              ? "border-[#e6c2c3] bg-[#fbeeee] text-[#9f5859]"
              : "border-[var(--pink-line)] bg-[var(--pink)] text-[var(--green)]"
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="mt-6">
        {!content ? (
          <p className="text-[var(--muted)]">Загружаем контент…</p>
        ) : tab === "hero" ? (
          <PhotoManager
            target={{ kind: "section", section: "hero" }}
            photos={content.hero.photos}
            title="Фотографии шапки"
            hint="В шапке сайта показываются первые две фотографии: первая — большая вертикальная, вторая — над логотипом. Порядок меняется стрелками."
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "studio" ? (
          <PhotoManager
            target={{ kind: "section", section: "studio" }}
            photos={content.studio.photos}
            title="Фотографии студии"
            hint="Лента фотографий в разделе «Студия»."
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "projects" ? (
          <CollectionManager
            kind="projects"
            items={content.projects}
            labels={projectLabels}
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "zones" ? (
          <CollectionManager
            kind="zones"
            items={content.zones}
            labels={zoneLabels}
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "wardrobe" ? (
          <PhotoManager
            target={{ kind: "section", section: "wardrobe" }}
            photos={content.wardrobe.photos}
            title="Гардероб в аренду"
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "equipment" ? (
          <EquipmentManager
            items={content.equipment}
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "sections" ? (
          <SectionsManager
            sections={content.sections}
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        ) : tab === "security" ? (
          <SecurityManager onError={setError} onMessage={setMessage} />
        ) : (
          <PhotoManager
            target={{ kind: "section", section: "light" }}
            photos={content.light.photos}
            title="Система освещения"
            onChanged={refresh}
            onError={setError}
            onMessage={setMessage}
          />
        )}
      </div>
    </main>
  );
}
