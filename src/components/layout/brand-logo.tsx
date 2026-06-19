import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  suffix?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function BrandLogo({ className, suffix, href = "/", size = "md" }: BrandLogoProps) {
  const content = (
    <span
      className={cn(
        "font-semibold tracking-[-0.02em] text-foreground",
        sizeClasses[size],
        className,
      )}
    >
      Passa<span className="text-primary">Nota</span>
      {suffix ? (
        <span className="ml-1.5 font-sans text-base font-medium text-muted-foreground">{suffix}</span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
