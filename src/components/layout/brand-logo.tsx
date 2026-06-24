import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  suffix?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
};

const sizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const iconSizeClasses = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function BrandLogo({
  className,
  suffix,
  href = "/",
  size = "md",
  variant = "full",
}: BrandLogoProps) {
  const content =
    variant === "icon" ? (
      <span
        className={cn(
          "font-sans font-bold tracking-tight text-primary",
          iconSizeClasses[size],
          className,
        )}
      >
        /N
      </span>
    ) : (
      <span
        className={cn(
          "font-sans font-bold tracking-[-0.02em] text-foreground",
          sizeClasses[size],
          className,
        )}
      >
        Passa<span className="text-primary">NOTA</span>
        {suffix ? (
          <span className="ml-1.5 font-sans text-base font-medium text-muted-foreground">
            {suffix}
          </span>
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
