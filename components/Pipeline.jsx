"use client";

import { PIPELINE } from "@/lib/generate";

// Визуальный пайплайн: Идея → Нарратив → Форматы → Дистрибуция.
// `active` — индекс текущего активного узла (для подсветки во время генерации),
// при -1 все узлы залиты (готовое состояние).
export default function Pipeline({ active = -1 }) {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex items-center gap-1 sm:gap-3">
        {PIPELINE.map((step, i) => {
          const lit = active === -1 || i <= active;
          return (
            <div key={step} className="flex items-center gap-1 sm:gap-3">
              <div
                className={[
                  "relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-500 sm:px-4 sm:text-sm",
                  lit
                    ? "border-plasma/40 bg-plasma/10 text-white shadow-glow"
                    : "border-white/5 bg-white/[0.02] text-white/35",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                    lit ? "bg-plasma shadow-[0_0_10px_2px_rgba(139,92,246,0.7)]" : "bg-white/20",
                  ].join(" ")}
                />
                {step}
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="relative h-px w-4 overflow-hidden bg-white/10 sm:w-8">
                  <div
                    className={[
                      "absolute inset-0 transition-transform duration-700",
                      lit && (active === -1 || i < active)
                        ? "translate-x-0 bg-gradient-to-r from-plasma to-electric"
                        : "-translate-x-full bg-white/10",
                    ].join(" ")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
