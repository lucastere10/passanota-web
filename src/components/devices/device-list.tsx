"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revokeDeviceClient, updateDeviceClient } from "@/lib/api/device-client";
import type { Device } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

export function DeviceList({
  devices,
  onChanged,
}: {
  devices: Device[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(device: Device) {
    setEditingId(device.id);
    setEditName(device.nome ?? "");
  }

  function saveName(deviceId: string) {
    startTransition(async () => {
      try {
        await updateDeviceClient(deviceId, { nome: editName.trim() || undefined });
        setEditingId(null);
        toast.success("Dispositivo atualizado.");
        onChanged();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
      }
    });
  }

  function revoke(deviceId: string) {
    if (!confirm("Revogar este dispositivo? Ele não poderá mais capturar notas.")) return;

    startTransition(async () => {
      try {
        await revokeDeviceClient(deviceId);
        toast.success("Dispositivo revogado.");
        onChanged();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao revogar.");
      }
    });
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">Nenhum dispositivo conectado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último uso</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-mono text-xs">{device.id.slice(0, 8)}…</TableCell>
              <TableCell>
                {editingId === device.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      placeholder="Ex: Celular João"
                    />
                    <Button size="sm" onClick={() => saveName(device.id)} disabled={isPending}>
                      Salvar
                    </Button>
                  </div>
                ) : (
                  device.nome ?? <span className="text-muted-foreground">Sem nome</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={device.is_active ? "default" : "secondary"}>
                  {device.is_active ? "Ativo" : "Revogado"}
                </Badge>
              </TableCell>
              <TableCell>{formatDateTime(device.last_used_at)}</TableCell>
              <TableCell>{device.invoice_count}</TableCell>
              <TableCell className="text-right">
                {device.is_active ? (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEdit(device)}
                      aria-label="Renomear"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => revoke(device.id)}
                      disabled={isPending}
                      aria-label="Revogar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
