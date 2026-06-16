import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import AuthProvider from "@/components/AuthProvider";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata = {
  title: "AI-помощник ведущего — тема мероприятия в готовый набор",
  description:
    "Введи тему мероприятия — AI развернёт её в сценарий ведущего, визуальную концепцию, тайминг, банк шуток, чек-лист и идеи активностей.",
  applicationName: "Помощник ведущего",
  appleWebApp: {
    capable: true,
    title: "Помощник ведущего",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#07070b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-graphite-950 font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <ServiceWorker />
      </body>
    </html>
  );
}
