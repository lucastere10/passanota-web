"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof THEMES)[number];

function nextTheme(current: Theme): Theme {
  const index = THEMES.indexOf(current);
  return THEMES[(index + 1) % THEMES.length];
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleToggle() {
    const current = (theme ?? "system") as Theme;
    setTheme(nextTheme(current));
  }

  const activeTheme = mounted ? (theme ?? "system") : "system";
  const isDark = mounted && (resolvedTheme === "dark" || activeTheme === "dark");

  const label =
    activeTheme === "system"
      ? "Tema: sistema"
      : activeTheme === "dark"
        ? "Tema: escuro"
        : "Tema: claro";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className={cn("relative text-muted-foreground hover:text-foreground", className)}
    >
      {!mounted ? (
        <Sun className="h-4 w-4" />
      ) : activeTheme === "system" ? (
        <Monitor className="h-4 w-4" />
      ) : isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
