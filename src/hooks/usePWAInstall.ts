import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") return;

    // Detect iOS Safari
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !("standalone" in navigator);

    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const dismissBanner = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setIsInstallable(false);
  };

  return {
    isInstallable,
    installApp,
    dismissBanner,
    isIOS,
  };
}
