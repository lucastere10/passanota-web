"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearDeviceToken } from "@/lib/auth/device";

export function MobileSignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    clearDeviceToken();
    router.replace("/m/pair");
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleSignOut} aria-label="Sair">
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
