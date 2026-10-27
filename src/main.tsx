import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerNotificationNavigationHandler } from "@/lib/preferences";

createRoot(document.getElementById("root")!).render(<App />);

registerNotificationNavigationHandler();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/gigclose-sw.js").catch(() => {
      /* Service worker registration is best-effort for notifications. */
    });
  });
}
