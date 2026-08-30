"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { DemoTourDialog } from "@/components/landing/demo-tour/demo-tour-dialog";

type DemoTourContextValue = {
  openDemo: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export function DemoTourProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDemo = useCallback(() => setOpen(true), []);

  return (
    <DemoTourContext.Provider value={{ openDemo }}>
      {children}
      <DemoTourDialog open={open} onOpenChange={setOpen} />
    </DemoTourContext.Provider>
  );
}

export function useDemoTourLauncher() {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error("useDemoTourLauncher must be used within DemoTourProvider");
  }
  return context;
}
