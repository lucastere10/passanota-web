"use client";

import { Button } from "@/components/ui/button";
import { useDemoTourLauncher } from "@/components/landing/demo-tour/demo-tour-provider";

export function DemoTourTrigger({
  variant = "outline",
  size = "default",
  className,
  children = "Ver simulação",
}: {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}) {
  const { openDemo } = useDemoTourLauncher();

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={openDemo}>
      {children}
    </Button>
  );
}
