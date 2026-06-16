"use client";

import { useEffect, useRef, useState } from "react";
import { generateSystem, fallbackSystem, PIPELINE } from "@/lib/generate";
import Pipeline from "@/components/Pipeline";
import ContentCard from "@/components/ContentCard";
import AuthButton from "@/components/AuthButton";
import SavedSystems from "@/components/SavedSystems";
import { useAuth } from "@/components/AuthProvider";
import { saveSystem, getSystem } from "@/lib/systems";

const EXAMPLES = [
  "Свадьба в стиле Великого Гэтсби",
  "Корпоратив IT-компании",
  "Юбилей 50 лет",
];

// Фазы генерации, которые «проходит» тема по пайплайну.
const PHASES = [
  "Считываю тему мероприятия…",
  "Пишу сценарий ведущего…",
  "Раскладываю по форматам…",
  "Готовлю материалы…",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState("idle"); // idle | generating | done
  const [activeNode, setActiveNode] = useState(-1);
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const intervalRef = useRef(null);
  const { user, configured } = useAuth();

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const run = async () => {
    const value = idea.trim();
    if (!value || stage === "generating") return;

    // Гейт по входу: генерация только для залогиненных.
    if (configured && !user) {
      setNotice('Войди в приложение (кнопка «Войти» вверху), чтобы сгенерировать материалы.');
      return;
    }

    clearInterval(intervalRef.current);
    setResult(null);
    setNotice("");
    setSaveState("idle");
    setStage("generating");

    // Прокручиваем фазы пайплайна, пока ждём ответ AI.
    let node = 0;
    setActiveNode(0);
    intervalRef.current = setInterval(() => {
      node = (node + 1) % PHASES.length;
      setActiveNode(node);
    }, 750);

    try {
      const data = await generateSystem(value);
      setResult(data);
    } catch (err) {
      if (err?.status === 401) {
        // Сессия отсутствует/истекла — просим войти, демо не показываем.
        setNotice('Нужен вход. Нажми «Войти» вверху и попробуй снова.');
      } else {
        // AI недоступен — показываем локальный шаблон и предупреждаем.
        setNotice(
          err?.status === 503
            ? "AI ещё не подключён — показан демо-шаблон."
            : `Не удалось сгенерировать через AI (${err?.message || "ошибка"}). Показан демо-шаблон.`
        );
        setResult(fallbackSystem(value));
      }
    } finally {
      clearInterval(intervalRef.current);
      setActiveNode(-1);
      setStage("done");
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setStage("idle");
    setResult(null);
    setNotice("");
    setSaveState("idle");
    setActiveNode(-1);
  };

  // Сохранить текущий набор в облако
  const save = async () => {
    if (!result || !user) return;
    const title =
      window.prompt("Название набора:", result.idea || "Мероприятие") || result.idea;
    if (!title) return;
    setSaveState("saving");
    try {
      await saveSystem({
        title,
        idea: result.idea,
        cards: result.cards,
        userId: user.id,
      });
      setSaveState("saved");
      setReloadToken((t) => t + 1);
    } catch (err) {
      setSaveState("idle");
      alert("Не удалось сохранить: " + (err.message || "ошибка"));
    }
  };

  // Загрузить сохранённый набор
  const loadSaved = async (id) => {
    try {
      const sys = await getSystem(id);
      clearInterval(intervalRef.current);
      setNotice("");
      setSaveState("saved");
      setResult({ idea: sys.idea || sys.title, cards: sys.cards || [] });
      setStage("done");
      setActiveNode(-1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Не удалось загрузить: " + (err.message || "ошибка"));
    }
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      {/* фон */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid" />
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-plasma/20 opacity-40 blur-[120px]" />
      <div className="pointer-events-none fixed right-0 top-1/3 -z-10 h-[360px] w-[360px] rounded-full bg-electric/15 opacity-40 blur-[120px]" />

      {/* шапка */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-plasma/30 bg-plasma/10">
            <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-plasma to-electric shadow-[0_0_12px_2px_rgba(139,92,246,0.6)]" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight text-white/90">
            CONTENT<span className="text-plasma">.</span>SYSTEM
          </span>
        </div>
        <AuthButton />
      </header>

      {/* герой */}
      <section className="mt-16 text-center sm:mt-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] tracking-wide text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-plasma" />
          AI ДЛЯ ВЕДУЩЕГО · EVENT CONTENT ENGINE
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Одна тема мероприятия —{" "}
          <span className="bg-gradient-to-r from-plasma via-indigo-400 to-electric bg-clip-text text-transparent">
            готовый набор ведущего
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm text-white/50 sm:text-base">
          Введи тему или идею мероприятия. AI развернёт её в сценарий ведущего,
          визуальную концепцию, тайминг, банк шуток, чек-лист и идеи активностей —
          за секунды.
        </p>
      </section>

      {/* ввод */}
      <section className="mx-auto mt-10 w-full max-w-2xl">
        <div className="glow-border rounded-2xl p-1.5">
          <div className="rounded-xl bg-graphite-900/60 p-3">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={onKeyDown}
              rows={3}
              placeholder="Например: свадьба в стиле Великого Гэтсби…"
              className="w-full resize-none bg-transparent px-2 py-1 text-base text-white placeholder-white/25 outline-none"
            />
            <div className="mt-2 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setIdea(ex)}
                    className="rounded-full border border-white/8 bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/45 transition-colors hover:border-plasma/30 hover:text-white/80"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <button
                onClick={run}
                disabled={!idea.trim() || stage === "generating"}
                className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-plasma to-electric px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:shadow-[0_0_50px_-6px_rgba(139,92,246,0.7)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {stage === "generating" ? (
                  <>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-white" />
                      <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-white [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-white [animation-delay:0.4s]" />
                    </span>
                    Разворачиваю…
                  </>
                ) : (
                  <>
                    Развернуть в материалы
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-white/25">
          ⌘ / Ctrl + Enter — быстрый запуск · генерация через Claude AI
        </p>
        {notice && (
          <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-center text-xs text-amber-300/90">
            {notice}
          </p>
        )}
      </section>

      {/* сохранённые наборы (для залогиненных) */}
      <SavedSystems reloadToken={reloadToken} onLoad={loadSaved} />

      {/* пайплайн */}
      <section className="mt-12">
        <Pipeline active={stage === "generating" ? activeNode : stage === "done" ? -1 : -1} />
        {stage === "generating" && (
          <p className="mt-4 text-center font-mono text-xs text-plasma/80">
            {PHASES[Math.max(0, Math.min(activeNode, PHASES.length - 1))]}
          </p>
        )}
      </section>

      {/* состояние генерации (сканер) */}
      {stage === "generating" && (
        <div className="mx-auto mt-10 w-full max-w-2xl">
          <div className="glow-border relative h-28 overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-plasma to-transparent" />
            <div className="flex h-full items-center justify-center">
              <div className="space-y-2 text-center">
                <div className="font-mono text-xs text-white/40">
                  PARSING SIGNAL → {PIPELINE[Math.min(activeNode, PIPELINE.length - 1)] || "Идея"}
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-plasma/60"
                      style={{
                        height: `${8 + ((i * 7 + activeNode * 11) % 22)}px`,
                        opacity: 0.3 + ((i + activeNode) % 5) * 0.14,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* результат */}
      {stage === "done" && result && (
        <section className="mt-12">
          <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">
                материалы для мероприятия
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                «{result.idea}»
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={save}
                  disabled={saveState === "saving"}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-plasma to-electric px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-[0_0_30px_-6px_rgba(139,92,246,0.7)] disabled:opacity-50"
                >
                  {saveState === "saving"
                    ? "Сохраняем…"
                    : saveState === "saved"
                      ? "Сохранено ✓"
                      : "Сохранить"}
                </button>
              )}
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:border-plasma/40 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Новая тема
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.cards.map((card, i) => (
              <div
                key={card.id}
                className={i === result.cards.length - 1 && result.cards.length % 2 === 1 ? "md:col-span-2" : ""}
              >
                <ContentCard card={card} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-auto pt-20 text-center font-mono text-[11px] text-white/20">
        AI-помощник ведущего · генерация на Claude · event content engine
      </footer>
    </main>
  );
}
