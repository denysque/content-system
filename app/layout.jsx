import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "AI-помощник ведущего — тема мероприятия в готовый набор",
  description:
    "Введи тему мероприятия — AI развернёт её в сценарий ведущего, визуальную концепцию, тайминг, банк шуток, чек-лист и идеи активностей.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-graphite-950 font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
