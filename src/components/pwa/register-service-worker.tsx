"use client";

import { useEffect } from "react";

import { PWA_SW_SCOPE, PWA_SW_URL } from "@/lib/pwa/constants";

let didRegister = false;

export function RegisterServiceWorker() {
  useEffect(() => {
    if (didRegister || !("serviceWorker" in navigator)) {
      return;
    }
    didRegister = true;
    void navigator.serviceWorker.register(PWA_SW_URL, { scope: PWA_SW_SCOPE }).catch(() => {
      didRegister = false;
    });
  }, []);

  return null;
}
