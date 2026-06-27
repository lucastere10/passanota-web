"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, WifiOff } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiUnavailableState({
  title = "Serviço temporariamente indisponível",
  description = "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.",
}: {
  title?: string;
  description?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b border-border px-6">
        <BrandLogo href="/dashboard" size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <WifiOff className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 size-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
