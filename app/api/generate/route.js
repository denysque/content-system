import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { FORMATS } from "@/lib/formats";

export const runtime = "nodejs";
export const maxDuration = 60;

// Проверяем Supabase-сессию по Bearer-токену. Возвращает user или null.
async function getUser(req) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const sb = createClient(url, key);
    const { data, error } = await sb.auth.getUser(token);
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

// Форматы (id/format/badge/accent/instr) — единый источник в @/lib/formats.

const SYSTEM_PROMPT = `Ты — опытный продюсер и сценарист мероприятий, помогаешь ведущему (тамаде, конферансье) готовить материалы под конкретную тему мероприятия. Пиши на русском, конкретно под тему, без воды и общих фраз. Не используй markdown-заголовки и тройные кавычки. Никаких «вставьте имя» — придумывай живые детали.`;

// Схема одной карточки.
const CARD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    leverage: { type: "integer" },
  },
  required: ["title", "body", "leverage"],
};

export async function POST(req) {
  // Гейт по входу: генерация только для залогиненных пользователей.
  const user = await getUser(req);
  if (!user) {
    return Response.json(
      { error: "Нужен вход. Войди в приложение и попробуй снова." },
      { status: 401 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI не настроен: отсутствует ANTHROPIC_API_KEY" },
      { status: 503 }
    );
  }

  let idea = "";
  try {
    const body = await req.json();
    idea = (body?.idea || "").toString().trim();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!idea) return Response.json({ error: "Пустая идея" }, { status: 400 });
  if (idea.length > 800) idea = idea.slice(0, 800);

  const client = new Anthropic();

  const genCard = async (f) => {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: CARD_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `Тема мероприятия: «${idea}».\n\nСформируй карточку «${f.format}».\n${f.instr}\n\nВерни JSON: "title" — цепляющий подзаголовок под эту тему (до 60 символов); "body" — основной текст с переносами строк (\\n); "leverage" — целое 70–98 (насколько формат полезен для этой темы).`,
        },
      ],
    });
    if (response.stop_reason === "refusal") throw new Error("refusal");
    const textBlock = response.content.find((b) => b.type === "text");
    return JSON.parse(textBlock.text);
  };

  try {
    const results = await Promise.allSettled(FORMATS.map(genCard));

    const cards = FORMATS.map((f, i) => {
      const r = results[i];
      const c = r.status === "fulfilled" ? r.value : {};
      return {
        id: f.id,
        badge: f.badge,
        format: f.format,
        accent: f.accent,
        leverage: clampScore(c.leverage),
        title: c.title || f.format,
        body: (c.body || "").toString(),
      };
    });

    // Если вообще ничего не сгенерировалось — это ошибка (ключ/баланс/сеть).
    const anyOk = results.some((r) => r.status === "fulfilled");
    if (!anyOk) {
      const firstErr = results.find((r) => r.status === "rejected")?.reason;
      if (firstErr instanceof Anthropic.AuthenticationError) {
        return Response.json({ error: "Неверный API-ключ Anthropic" }, { status: 500 });
      }
      if (firstErr instanceof Anthropic.RateLimitError) {
        return Response.json(
          { error: "Слишком много запросов. Попробуй через минуту." },
          { status: 429 }
        );
      }
      const msg = (firstErr?.message || "").toLowerCase();
      if (msg.includes("credit balance")) {
        return Response.json(
          { error: "Недостаточно средств на балансе Anthropic." },
          { status: 402 }
        );
      }
      return Response.json(
        { error: "Не удалось сгенерировать. Попробуй ещё раз." },
        { status: 500 }
      );
    }

    return Response.json({ idea, cards });
  } catch (err) {
    console.error("generate error:", err);
    return Response.json(
      { error: "Не удалось сгенерировать. Попробуй ещё раз." },
      { status: 500 }
    );
  }
}

function clampScore(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 85;
  return Math.max(70, Math.min(98, v));
}
