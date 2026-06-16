"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { listSystems, deleteSystem } from "@/lib/systems";

export default function SavedSystems({ reloadToken, onLoad }) {
  const { configured, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setItems(await listSystems());
    } catch (e) {
      setError(e.message || "Не удалось загрузить");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh, reloadToken]);

  if (!configured || !user) return null;
  if (!loading && items.length === 0) return null;

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Удалить этот набор?")) return;
    try {
      await deleteSystem(id);
      await refresh();
    } catch (err) {
      setError(err.message || "Не удалось удалить");
    }
  };

  return (
    <section className="mx-auto mt-8 w-full max-w-2xl">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Мои сохранённые наборы
          </span>
          <span className="rounded-full bg-plasma/15 px-2 text-[11px] leading-5 text-plasma">
            {items.length}
          </span>
        </div>
        {error && <div className="mb-2 text-xs text-red-400">{error}</div>}
        <div className="flex flex-col gap-1.5">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => onLoad(it.id)}
              className="group flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-left transition-colors hover:border-plasma/40"
            >
              <span className="flex-1 truncate text-sm text-white/85">{it.title}</span>
              <span className="font-mono text-[11px] text-white/30">
                {new Date(it.created_at).toLocaleDateString("ru-RU")}
              </span>
              <span
                onClick={(e) => remove(it.id, e)}
                className="rounded px-1.5 text-white/30 hover:text-red-400"
                title="Удалить"
              >
                ✕
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
