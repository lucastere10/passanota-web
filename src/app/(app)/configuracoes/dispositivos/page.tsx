"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";

import { GestorGuard } from "@/components/auth/gestor-guard";
import { DeviceList } from "@/components/devices/device-list";
import { EmpresaPinForm } from "@/components/devices/empresa-pin-form";
import { PairDeviceDialog } from "@/components/devices/pair-device-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useEmpresa } from "@/components/providers/empresa-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmpresaPinStatusClient, listDevicesClient } from "@/lib/api/device-client";
import type { Device } from "@/lib/api/types";

export default function DispositivosPage() {
  const { selectedEmpresaId } = useEmpresa();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pairOpen, setPairOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (!selectedEmpresaId) return;
    startTransition(async () => {
      try {
        const [pinStatus, deviceList] = await Promise.all([
          getEmpresaPinStatusClient(selectedEmpresaId),
          listDevicesClient(),
        ]);
        setPinConfigured(pinStatus.pin_configured);
        setDevices(deviceList);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar dispositivos.");
      }
    });
  }, [selectedEmpresaId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <GestorGuard>
      <div className="space-y-6">
        <PageHeader
          title="Dispositivos"
          description="Gerencie celulares autorizados a capturar notas fiscais."
        />

        {selectedEmpresaId ? (
          <EmpresaPinForm
            empresaId={selectedEmpresaId}
            pinConfigured={pinConfigured}
            onUpdated={load}
          />
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Dispositivos conectados</CardTitle>
              <CardDescription>
                {devices.filter((d) => d.is_active).length} ativo(s) de {devices.length} registrado(s)
              </CardDescription>
            </div>
            <Button
              onClick={() => setPairOpen(true)}
              disabled={!pinConfigured || isPending}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Conectar dispositivo
            </Button>
          </CardHeader>
          <CardContent>
            <DeviceList devices={devices} onChanged={load} />
          </CardContent>
        </Card>
      </div>

      <PairDeviceDialog open={pairOpen} onClose={() => setPairOpen(false)} />
    </GestorGuard>
  );
}
