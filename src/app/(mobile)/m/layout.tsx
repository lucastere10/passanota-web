import type { Metadata, Viewport } from "next";

import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";

export const metadata: Metadata = {
  applicationName: "PassaNota",
  title: "PassaNota",
  description: "Capture notas fiscais pelo celular.",
  manifest: "/m/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/m/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/m/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c4f4a",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function MobileRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <RegisterServiceWorker />
    </>
  );
}
