"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CaptureInvoiceResponse, Invoice } from "@/lib/api/types";
import type { CaptureQueueItem } from "@/lib/scan/detection-types";
import { getInvoiceClient } from "@/lib/api/client";

const POLL_INTERVAL_MS = 3000;
const MAX_VISIBLE_ITEMS = 6;

type UseCaptureQueueOptions = {
  captureFn: (file: File) => Promise<CaptureInvoiceResponse>;
  getInvoiceFn?: (id: string) => Promise<Invoice>;
};

function createLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCaptureQueue({
  captureFn,
  getInvoiceFn = getInvoiceClient,
}: UseCaptureQueueOptions) {
  const [items, setItems] = useState<CaptureQueueItem[]>([]);
  const itemsRef = useRef(items);
  const captureFnRef = useRef(captureFn);
  const getInvoiceFnRef = useRef(getInvoiceFn);

  useEffect(() => {
    itemsRef.current = items;
    captureFnRef.current = captureFn;
    getInvoiceFnRef.current = getInvoiceFn;
  });

  const updateItem = useCallback((localId: string, patch: Partial<CaptureQueueItem>) => {
    setItems((current) =>
      current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
    );
  }, []);

  const addItem = useCallback(
    async (file: File, thumbnailDataUrl: string) => {
      const localId = createLocalId();
      const queueItem: CaptureQueueItem = {
        localId,
        invoiceId: null,
        thumbnailDataUrl,
        status: "uploading",
        capturedAt: Date.now(),
      };

      setItems((current) => [queueItem, ...current].slice(0, MAX_VISIBLE_ITEMS));

      try {
        const response = await captureFnRef.current(file);
        updateItem(localId, {
          invoiceId: response.invoice.id,
          status: "pending",
        });
      } catch (error) {
        updateItem(localId, {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Falha no envio",
        });
      }
    },
    [updateItem],
  );

  useEffect(() => {
    let cancelled = false;

    async function pollPending() {
      const pendingItems = itemsRef.current.filter(
        (item) => item.status === "pending" && item.invoiceId,
      );
      if (pendingItems.length === 0) return;

      await Promise.all(
        pendingItems.map(async (item) => {
          if (!item.invoiceId) return;

          try {
            const invoice = await getInvoiceFnRef.current(item.invoiceId);
            if (cancelled || invoice.status === "pending") return;

            updateItem(item.localId, {
              status: invoice.status,
              invoice,
              errorMessage: invoice.error_message ?? undefined,
            });
          } catch (error) {
            if (cancelled) return;
            updateItem(item.localId, {
              errorMessage: error instanceof Error ? error.message : "Erro ao consultar status",
            });
          }
        }),
      );
    }

    void pollPending();
    const intervalId = window.setInterval(() => void pollPending(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [updateItem]);

  return { items, addItem };
}
