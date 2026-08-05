"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types";

type Mode = "create" | "edit";

export function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function refreshItems() {
    const response = await fetch("/api/gallery", { cache: "no-store" });
    const data = (await response.json()) as { items: GalleryItem[] };
    setItems(data.items || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await me.json()) as { authenticated: boolean };
        if (cancelled) return;
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) await refreshItems();
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage(null);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Не удалось войти");
      }
      setAuthenticated(true);
      setPassword("");
      await refreshItems();
      setMessage("Вы вошли в админ-панель");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setItems([]);
    resetForm();
    setBusy(false);
  }

  function startEdit(item: GalleryItem) {
    setMode("edit");
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImage(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      if (image) formData.set("image", image);

      const response =
        mode === "create"
          ? await fetch("/api/gallery", { method: "POST", body: formData })
          : await fetch(`/api/gallery/${editingId}`, {
              method: "PUT",
              body: formData,
            });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Не удалось сохранить работу");
      }

      await refreshItems();
      resetForm();
      setMessage(mode === "create" ? "Работа добавлена" : "Работа обновлена");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить эту работу из галереи?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Не удалось удалить");
      }
      if (editingId === id) resetForm();
      await refreshItems();
      setMessage("Работа удалена");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setBusy(false);
    }
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
      <main className="mx-auto flex min-h-screen w-[min(480px,100%)] flex-col justify-center px-5 py-16">
        <Link href="/" className="mb-8 text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          ← На сайт
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Админ Secret Garden</h1>
        <p className="mt-3 text-[var(--muted)]">
          Войдите, чтобы добавлять и редактировать работы в галерее.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
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
        <p className="mt-6 text-xs text-[var(--muted)]">
          По умолчанию пароль: <code>secretgarden</code>. Задайте свой через
          переменную окружения <code>ADMIN_PASSWORD</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[min(1040px,100%)] px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            ← На сайт
          </Link>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
            Управление галереей
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Добавляйте, редактируйте и удаляйте работы на сайте.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout} disabled={busy}>
          Выйти
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-4 rounded-[1.75rem] bg-[rgba(255,255,255,0.55)] p-6 backdrop-blur-sm"
      >
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          {mode === "create" ? "Новая работа" : "Редактирование"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="field md:col-span-2">
            <label htmlFor="title">Название</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Например, Утренний свет"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Коротко о съёмке"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="image">
              {mode === "create" ? "Изображение" : "Новое изображение (необязательно)"}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
              required={mode === "create"}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-[#b56b6c]">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--sage-deep)]">{message}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : mode === "create" ? "Добавить" : "Сохранить"}
          </button>
          {mode === "edit" ? (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={busy}>
              Отменить
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Работы ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-[var(--muted)]">Галерея пока пуста.</p>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-[1.5rem] bg-[rgba(255,255,255,0.5)] p-4 sm:grid-cols-[140px_1fr_auto]"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-28 w-full rounded-[1rem] object-cover sm:h-full"
                />
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.description || "Без описания"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <button
                    type="button"
                    className="btn btn-ghost !min-h-10"
                    onClick={() => startEdit(item)}
                    disabled={busy}
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger !min-h-10"
                    onClick={() => handleDelete(item.id)}
                    disabled={busy}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
