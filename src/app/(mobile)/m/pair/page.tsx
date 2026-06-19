"use client";



import { useRouter, useSearchParams } from "next/navigation";

import { Suspense, useEffect, useState, useTransition } from "react";

import { toast } from "sonner";



import { BrandLogo } from "@/components/layout/brand-logo";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { pairDeviceClient } from "@/lib/api/device-client";

import { hasDeviceToken, setDeviceToken } from "@/lib/auth/device";



function PairForm() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const pairingToken = searchParams.get("token") ?? "";



  const [pin, setPin] = useState("");

  const [nome, setNome] = useState("");

  const [isPending, startTransition] = useTransition();



  useEffect(() => {

    if (hasDeviceToken()) {

      router.replace("/m/scan");

    }

  }, [router]);



  function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!pairingToken) {

      toast.error("Link de pareamento inválido. Solicite um novo QR code.");

      return;

    }



    startTransition(async () => {

      try {

        const result = await pairDeviceClient({

          pairing_token: pairingToken,

          pin,

          nome: nome.trim() || undefined,

        });

        setDeviceToken(result.device_token);

        toast.success(`Conectado à ${result.empresa_nome}`);

        router.replace("/m/scan");

      } catch (err) {

        toast.error(err instanceof Error ? err.message : "Erro ao parear dispositivo.");

      }

    });

  }



  return (

    <Card className="mx-auto w-full max-w-md">

      <CardHeader>

        <CardTitle>Conectar dispositivo</CardTitle>

        <CardDescription>

          Digite o PIN da empresa para autorizar este celular.

        </CardDescription>

      </CardHeader>

      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">

          {!pairingToken ? (

            <p className="text-sm text-destructive">

              Link inválido. Peça ao gestor para gerar um novo QR code.

            </p>

          ) : null}

          <div className="space-y-2">

            <Label htmlFor="nome">Nome do dispositivo (opcional)</Label>

            <Input

              id="nome"

              value={nome}

              onChange={(e) => setNome(e.target.value)}

              placeholder="Ex: Celular João"

            />

          </div>

          <div className="space-y-2">

            <Label htmlFor="pin">PIN da empresa</Label>

            <Input

              id="pin"

              type="password"

              inputMode="numeric"

              autoComplete="off"

              maxLength={20}

              value={pin}

              onChange={(e) => setPin(e.target.value)}

              required

            />

          </div>

          <Button type="submit" className="w-full" disabled={isPending || !pairingToken}>

            Conectar

          </Button>

        </form>

      </CardContent>

    </Card>

  );

}



export default function MobilePairPage() {

  return (

    <div className="ledger-bg flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">

      <div className="mb-8 text-center">

        <BrandLogo href="/" size="lg" />

        <p className="mt-2 text-sm text-muted-foreground">Acesso mobile</p>

      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>

        <PairForm />

      </Suspense>

    </div>

  );

}

