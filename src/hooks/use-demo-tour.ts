"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEMO_SCENARIO, type DemoTourStep } from "@/lib/demo/demo-scenario";

const EXTRACTING_DURATION_MS = 2500;
const ITEM_STAGGER_MS = 300;
const CONFIDENCE_TICK_MS = 40;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useDemoTour(open: boolean) {
  const [step, setStep] = useState<DemoTourStep>("intro");
  const [flashActive, setFlashActive] = useState(false);
  const [visibleItemCount, setVisibleItemCount] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const timersRef = useRef<number[]>([]);
  const extractionStartedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setStep("intro");
    setFlashActive(false);
    setVisibleItemCount(0);
    setDisplayConfidence(0);
    setExtractionComplete(false);
    extractionStartedRef.current = false;
  }, [clearTimers]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const goToCapture = useCallback(() => setStep("capture"), []);

  const simulateCapture = useCallback(() => {
    setFlashActive(true);
    schedule(() => {
      setFlashActive(false);
      setStep("extracting");
    }, 350);
  }, [schedule]);

  const startExtractionAnimation = useCallback(() => {
    const reduced = prefersReducedMotion();
    const itemCount = DEMO_SCENARIO.items.length;
    const targetConfidence = DEMO_SCENARIO.confidence;

    if (reduced) {
      setVisibleItemCount(itemCount);
      setDisplayConfidence(targetConfidence);
      setExtractionComplete(true);
      schedule(() => setStep("result"), 400);
      return;
    }

    for (let i = 0; i < itemCount; i += 1) {
      schedule(() => setVisibleItemCount(i + 1), i * ITEM_STAGGER_MS);
    }

    const confidenceSteps = Math.round(targetConfidence / 0.01);
    for (let i = 1; i <= confidenceSteps; i += 1) {
      schedule(() => setDisplayConfidence(i * 0.01), i * CONFIDENCE_TICK_MS);
    }

    schedule(() => {
      setDisplayConfidence(targetConfidence);
      setExtractionComplete(true);
    }, EXTRACTING_DURATION_MS);

    schedule(() => setStep("result"), EXTRACTING_DURATION_MS + 400);
  }, [schedule]);

  useEffect(() => {
    if (step !== "extracting") {
      extractionStartedRef.current = false;
      return;
    }
    if (extractionStartedRef.current) return;
    extractionStartedRef.current = true;
    startExtractionAnimation();
  }, [step, startExtractionAnimation]);

  const goToCta = useCallback(() => setStep("cta"), []);

  return {
    step,
    flashActive,
    visibleItemCount,
    displayConfidence,
    extractionComplete,
    goToCapture,
    simulateCapture,
    goToCta,
    reset,
  };
}
