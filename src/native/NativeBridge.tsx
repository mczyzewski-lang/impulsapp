import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { APP_DOMAIN } from "@/config";

/** Czy aplikacja działa jako natywna (iOS / Android), a nie w przeglądarce. */
export const isNative = Capacitor.isNativePlatform();

/**
 * Most między powłoką natywną a routerem. W przeglądarce nic nie robi.
 *  - link z maila (https://impuls.app/k/...) otwiera właściwy ekran w aplikacji,
 *  - systemowy przycisk „wstecz” na Androidzie cofa w historii zamiast zamykać aplikację.
 */
export function NativeBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative) return;

    const urlOpen = CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      try {
        const target = new URL(url);
        if (target.hostname === APP_DOMAIN) navigate(target.pathname + target.search);
      } catch {
        /* nieznany format adresu — zostajemy na bieżącym ekranie */
      }
    });

    const backButton = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else void CapacitorApp.exitApp();
    });

    return () => {
      void urlOpen.then((handle) => handle.remove());
      void backButton.then((handle) => handle.remove());
    };
  }, [navigate]);

  return null;
}
