"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminApi, type AuthStatus } from "./api";

type Props = {
  onError: (message: string) => void;
  onMessage: (message: string) => void;
};

const MIN_LENGTH = 8;

export function SecurityManager({ onError, onMessage }: Props) {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [codePassword, setCodePassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminApi
      .authStatus()
      .then(setStatus)
      .catch((err) => onError(err instanceof Error ? err.message : "Не удалось получить статус"));
  }, [onError]);

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError("");
    if (newPassword.length < MIN_LENGTH) {
      onError(`Новый пароль должен быть не короче ${MIN_LENGTH} символов`);
      return;
    }
    if (newPassword !== confirmPassword) {
      onError("Пароли в полях «Новый пароль» и «Повторите пароль» не совпадают");
      return;
    }
    setBusy(true);
    try {
      const result = await adminApi.changePassword(currentPassword, newPassword);
      setStatus(result.status);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onMessage("Пароль изменён. На других устройствах потребуется войти заново");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось изменить пароль");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError("");
    if (
      status?.hasRecoveryCode &&
      !window.confirm("Прежний код восстановления перестанет действовать. Создать новый?")
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await adminApi.createRecoveryCode(codePassword);
      setStatus(result.status);
      setRecoveryCode(result.code);
      setCopied(false);
      setCodePassword("");
      onMessage("Код восстановления создан — сохраните его в надёжном месте");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось создать код");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
    } catch {
      onError("Не удалось скопировать — выделите код и скопируйте вручную");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleChangePassword} className="card space-y-4 p-6">
        <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">Смена пароля</h3>
        <p className="m-0 text-sm text-[var(--muted)]">
          {status === null
            ? "Загружаем состояние…"
            : status.customPassword
              ? `Пароль задан через админ-панель${status.passwordChangedAt ? ` (изменён ${new Date(status.passwordChangedAt).toLocaleString("ru-RU")})` : ""}.`
              : "Сейчас действует пароль из переменной окружения ADMIN_PASSWORD. После смены он будет храниться в зашифрованном виде в data/auth.json."}
        </p>
        <div className="field">
          <label htmlFor="current-password">Текущий пароль</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="new-password">Новый пароль</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            placeholder={`Не менее ${MIN_LENGTH} символов`}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm-password">Повторите пароль</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_LENGTH}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Сохраняем…" : "Изменить пароль"}
        </button>
      </form>

      <div className="space-y-6">
        <form onSubmit={handleCreateCode} className="card space-y-4 p-6">
          <h3 className="m-0 font-[family-name:var(--font-display)] text-2xl text-[var(--green)]">
            Код восстановления
          </h3>
          <p className="m-0 text-sm text-[var(--muted)]">
            Одноразовый код позволяет задать новый пароль по ссылке «Забыли пароль?» на странице входа, если
            текущий пароль утерян. Код показывается только один раз — запишите его. После использования нужно
            создать новый.
          </p>
          <p className="m-0 text-sm">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status?.hasRecoveryCode ? "bg-[#e8f1ea] text-[var(--green)]" : "bg-[#fbeeee] text-[#9f5859]"
              }`}
            >
              {status === null ? "…" : status.hasRecoveryCode ? "Код создан" : "Код не создан"}
            </span>
          </p>
          <div className="field">
            <label htmlFor="code-password">Подтвердите текущий пароль</label>
            <input
              id="code-password"
              type="password"
              autoComplete="current-password"
              value={codePassword}
              onChange={(event) => setCodePassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-ghost" disabled={busy}>
            {busy ? "Создаём…" : status?.hasRecoveryCode ? "Создать новый код" : "Создать код"}
          </button>

          {recoveryCode ? (
            <div className="rounded-[1rem] border border-[var(--pink-line)] bg-[var(--pink)] p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--rose)]">
                Ваш код восстановления
              </p>
              <p className="m-0 mt-2 select-all font-mono text-xl tracking-wider text-[var(--green)]">{recoveryCode}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-sm" onClick={copyCode}>
                  {copied ? "Скопировано" : "Скопировать"}
                </button>
                <span className="text-xs text-[var(--muted)]">Больше он показан не будет.</span>
              </div>
            </div>
          ) : null}
        </form>

        <div className="card p-6 text-sm text-[var(--muted)]">
          <h4 className="m-0 font-[family-name:var(--font-display)] text-lg text-[var(--green)]">
            Если утерян и пароль, и код
          </h4>
          <p className="mt-2">
            На сервере удалите файл <code>data/auth.json</code> — пароль вернётся к значению переменной окружения{" "}
            <code>ADMIN_PASSWORD</code>. После входа сразу задайте новый пароль и создайте код восстановления.
          </p>
        </div>
      </div>
    </div>
  );
}
