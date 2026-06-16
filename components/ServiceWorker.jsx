"use client";

import { useEffect } from "react";

// Регистрирует service worker (только в проде, чтобы не мешать dev-сборке).
// Ничего не рендерит.
export default function ServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
