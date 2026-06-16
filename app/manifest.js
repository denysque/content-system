// Web App Manifest — нативный route Next.js (отдаётся как /manifest.webmanifest).
// Next автоматически подставит <link rel="manifest"> в <head>.
// Делает приложение устанавливаемым («Добавить на главный экран»).

export default function manifest() {
  return {
    name: "Content System — AI-помощник ведущего",
    short_name: "Помощник ведущего",
    description:
      "Тема мероприятия → 6 готовых материалов для ведущего за секунды.",
    start_url: "/",
    display: "standalone",
    background_color: "#07070b",
    theme_color: "#07070b",
    lang: "ru",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
