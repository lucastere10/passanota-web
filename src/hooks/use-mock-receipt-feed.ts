"use client";

import { useEffect, useState } from "react";

export const RECEIPT_POOL = [
  { emitter: "Mercado Central Ltda.", amount: "R$ 342,80" },
  { emitter: "Distribuidora Sul", amount: "R$ 1.248,50" },
  { emitter: "Posto Ipiranga", amount: "R$ 189,00" },
  { emitter: "Office Supply Co.", amount: "R$ 567,30" },
  { emitter: "Restaurante Bom Sabor", amount: "R$ 94,20" },
  { emitter: "Tech Parts Brasil", amount: "R$ 2.100,00" },
] as const;

export type ReceiptEntry = (typeof RECEIPT_POOL)[number] & { id: number };

export function useMockReceiptFeed(visibleCount = 3) {
  const [entries, setEntries] = useState<ReceiptEntry[]>(() =>
    RECEIPT_POOL.slice(0, visibleCount).map((r, i) => ({ ...r, id: i })),
  );

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let poolIdx = visibleCount;
    let idCounter = visibleCount;

    const interval = setInterval(() => {
      const next = RECEIPT_POOL[poolIdx % RECEIPT_POOL.length];
      poolIdx += 1;
      const id = idCounter;
      idCounter += 1;
      setEntries((prev) => [{ ...next, id }, ...prev.slice(0, visibleCount - 1)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [visibleCount]);

  return entries;
}
