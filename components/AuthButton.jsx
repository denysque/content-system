"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthButton() {
  const { configured, user, loading, signInWithMagicLink, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  if (!configured) return null;
  if (loading) return <span className="font-mono text-[11px] text-white/35">…</span>;

  if (user) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="hidden max-w-[160px] truncate font-mono text-[11px] text-white/45 sm:inline">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-plasma/40 hover:text-white"
        >
          Выйти
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("sending");
    setErrorMsg("");
    const { error } = await signInWithMagicLink(value);
    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "Не удалось отправить ссылку");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-gradient-to-r from-plasma to-electric px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow transition-all hover:shadow-[0_0_30px_-6px_rgba(139,92,246,0.7)]"
        >
          Войти
        </button>
      ) : (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-white/10 bg-graphite-900 p-4 shadow-2xl">
          {status === "sent" ? (
            <div className="space-y-2 text-sm text-white/80">
              <strong className="text-white">Письмо отправлено!</strong>
              <p className="text-white/50">
                Проверь почту <b className="text-white/70">{email}</b> и перейди по ссылке для входа.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:text-white"
              >
                Закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-2.5">
              <label className="block text-xs font-medium text-white/80">
                Вход по ссылке на почту
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-plasma/50"
              />
              {status === "error" && (
                <div className="text-xs text-red-400">{errorMsg}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-lg bg-gradient-to-r from-plasma to-electric px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {status === "sending" ? "Отправляем…" : "Получить ссылку"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
