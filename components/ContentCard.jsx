"use client";

import { useState } from "react";

function CopyIcon({ copied }) {
  if (copied) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// Кольцо leverage score.
function LeverageRing({ value, accent }) {
  const stroke = accent === "electric" ? "#3b82f6" : "#8b5cf6";
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-white">{value}</span>
    </div>
  );
}

export default function ContentCard({ card, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Фолбэк для окружений без Clipboard API
      const ta = document.createElement("textarea");
      ta.value = card.body;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const accentText = card.accent === "electric" ? "text-electric" : "text-plasma";
  const accentBg = card.accent === "electric" ? "bg-electric/10" : "bg-plasma/10";

  return (
    <article
      className="glow-border group relative animate-fade-up overflow-hidden rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: `${index * 220}ms` }}
    >
      {/* мягкое свечение при наведении */}
      <div
        className={[
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          card.accent === "electric" ? "bg-electric/10" : "bg-plasma/10",
        ].join(" ")}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={[
              "inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.18em]",
              accentBg,
              accentText,
            ].join(" ")}
          >
            {card.badge}
          </span>
          <h3 className="mt-2 text-base font-semibold text-white sm:text-lg">
            {card.format}
          </h3>
          <p className="mt-0.5 text-sm text-white/45">{card.title}</p>
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <LeverageRing value={card.leverage} accent={card.accent} />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-white/35">
            leverage
          </span>
        </div>
      </div>

      <pre className="relative mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/5 bg-black/30 p-4 font-sans text-[13px] leading-relaxed text-white/80">
        {card.body}
      </pre>

      <div className="relative mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-white/30">
          ~{Math.max(1, Math.round(card.body.length / 90))} мин на адаптацию
        </span>
        <button
          onClick={handleCopy}
          className={[
            "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-200",
            copied
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-white/70 hover:border-plasma/40 hover:bg-plasma/10 hover:text-white",
          ].join(" ")}
        >
          <CopyIcon copied={copied} />
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
    </article>
  );
}
