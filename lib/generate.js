// Генерация набора материалов ведущего из темы мероприятия.
// Реальный вызов идёт на серверный route /api/generate (Claude Sonnet 4.6).
// Если AI недоступен (нет ключа / ошибка сети) — отдаём локальный фолбэк,
// чтобы приложение всегда что-то показывало.

import { supabase } from "./supabase";
import { FORMATS } from "./formats";

export const PIPELINE = ["Идея", "Сценарий", "Форматы", "Материалы"];

// Вызов реального AI. Бросает ошибку при не-2xx — обрабатывается в UI.
export async function generateSystem(rawIdea) {
  const idea = (rawIdea || "").trim();

  // Прикладываем access-токен сессии — сервер пускает только залогиненных.
  let token = null;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  }

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ idea }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || "Ошибка генерации");
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// Локальный фолбэк без AI (на случай ошибки) — простые шаблоны.
export function fallbackSystem(rawIdea) {
  const idea = (rawIdea || "").trim();
  const topic = idea ? idea[0].toUpperCase() + idea.slice(1) : "Мероприятие";

  const bodies = {
    script: `Добрый вечер, дорогие гости! (пауза) Сегодня мы собрались по особому поводу — «${topic}». (тёплая улыбка)\n\nПозвольте мне быть вашим проводником в этот вечер. Обещаю: скучать не придётся.\n\n(обращение к залу) Поднимите руку те, кто готов к настоящему празднику! Отлично — тогда начнём.`,
    visual: `— Палитра под тему «${topic}»: 2–3 базовых цвета + акцент\n— Фотозона с тематическим реквизитом\n— Оформление стола и приветственной зоны\n— Дресс-код для гостей в едином стиле\n— Детали: освещение, свечи, текстиль`,
    plan: `17:00 — Сбор гостей, велком-зона\n18:00 — Торжественное открытие, слово ведущего\n18:30 — Первый блок активностей\n19:30 — Банкетная пауза\n20:30 — Интерактивы и конкурсы\n22:00 — Финал, общее фото`,
    jokes: `1. Подводка к знакомству гостей\n2. Шутка про повод мероприятия\n3. Каламбур для разрядки\n4. Тёплая подводка к тосту\n5. Лёгкая шутка перед конкурсом`,
    checklist: `— [ ] Согласовать тайминг с площадкой\n— [ ] Подготовить музыку и микрофон\n— [ ] Распечатать тексты и реквизит\n— [ ] Проверить технику и свет\n— [ ] Списки гостей и имена\n— [ ] Запасной план на форс-мажор`,
    ideas: `— Интерактив на знакомство гостей\n— Тематический конкурс под «${topic}»\n— Сюрприз-момент в середине вечера\n— Командная игра\n— Финальная активность для общего фото`,
  };

  const cards = FORMATS.map((f, i) => ({
    id: f.id,
    badge: f.badge,
    format: f.format,
    accent: f.accent,
    leverage: 78 + ((i * 7) % 18),
    title: f.format,
    body: bodies[f.id] || "",
  }));

  return { idea: topic, cards };
}
