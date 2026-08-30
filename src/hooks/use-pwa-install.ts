"use client";

import { useCallback, useEffect, useState } from "react";

import { PWA_INSTALL_DISMISSED_KEY } from "@/lib/pwa/constants";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let savedPrompt: BeforeInstallPromptEvent | null = null;
let appInstalled = false;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((listener) => listener());
}

let didBindInstallEvents = false;

function subscribeToInstallEvents() {
  if (typeof window === "undefined" || didBindInstallEvents) {
    return;
  }
  didBindInstallEvents = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    savedPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    savedPrompt = null;
    appInstalled = true;
    notify();
  });
}

subscribeToInstallEvents();

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    appInstalled
  );
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "1");
  } catch {
    // private browsing / quota
  }
}

export function usePwaInstall() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const sync = () => {
      setCanPrompt(Boolean(savedPrompt));
      setStandalone(isStandaloneDisplay());
      setDismissed(readDismissed());
    };
    sync();
    subscribers.add(sync);
    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", sync);
    return () => {
      subscribers.delete(sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  const install = useCallback(async () => {
    if (!savedPrompt) {
      return;
    }
    const promptEvent = savedPrompt;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    savedPrompt = null;
    if (outcome === "accepted") {
      appInstalled = true;
    }
    notify();
  }, []);

  const dismiss = useCallback(() => {
    writeDismissed();
    setDismissed(true);
  }, []);

  return {
    visible: !standalone && !dismissed,
    canPrompt,
    install,
    dismiss,
  };
}
