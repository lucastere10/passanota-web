"use client";

import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { BarChart3, Camera, FileText, XIcon } from "lucide-react";

import { DemoTourStepContent } from "@/components/landing/demo-tour/demo-tour-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDemoTour } from "@/hooks/use-demo-tour";
import {
  DEMO_REGISTER_MESSAGE,
  DEMO_STEP_LABELS,
  demoStepToPhase,
  type DemoTourStep,
} from "@/lib/demo/demo-scenario";
import { cn } from "@/lib/utils";

const STEPPER_STEPS = [
  { key: "capture", label: DEMO_STEP_LABELS[0], icon: Camera },
  { key: "extract", label: DEMO_STEP_LABELS[1], icon: FileText },
  { key: "analyze", label: DEMO_STEP_LABELS[2], icon: BarChart3 },
] as const;

function getActiveStepperIndex(step: DemoTourStep): number {
  const phase = demoStepToPhase(step);
  if (phase <= 0) return -1;
  if (phase === 1) return 0;
  if (phase === 2) return 1;
  return 2;
}

type DemoTourDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DemoTourDialog({ open, onOpenChange }: DemoTourDialogProps) {
  const tour = useDemoTour(open);
  const activeStepperIndex = getActiveStepperIndex(tour.step);

  const registerHref = `/register?${new URLSearchParams({ mensagem: DEMO_REGISTER_MESSAGE }).toString()}`;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/20 transition-opacity duration-150",
            "data-ending-style:opacity-0 data-starting-style:opacity-0",
            "supports-backdrop-filter:backdrop-blur-xs",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col",
            "overflow-hidden rounded-xl border border-border bg-popover shadow-xl",
            "transition duration-200 ease-in-out",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                  Simulação do fluxo
                </DialogPrimitive.Title>
                <Badge variant="secondary">Demonstração</Badge>
              </div>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                Dados fictícios. Nenhuma informação é enviada ou armazenada.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              render={
                <Button variant="ghost" size="icon-sm" className="shrink-0" />
              }
            >
              <XIcon />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          </div>

          <nav aria-label="Progresso da simulação" className="border-b border-border px-5 py-3 sm:px-6">
            <ol className="flex items-center justify-between gap-2">
              {STEPPER_STEPS.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === activeStepperIndex;
                const isComplete = activeStepperIndex > index;
                return (
                  <li
                    key={item.key}
                    aria-current={isActive ? "step" : undefined}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                        isComplete && "border-primary bg-primary text-primary-foreground",
                        isActive && !isComplete && "border-primary bg-primary/10 text-primary",
                        !isActive && !isComplete && "border-border bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "hidden truncate text-sm sm:inline",
                        isActive ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                    {index < STEPPER_STEPS.length - 1 ? (
                      <div
                        className={cn(
                          "mx-1 hidden h-px flex-1 sm:block",
                          isComplete ? "bg-primary" : "bg-border",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <DemoTourStepContent
              step={tour.step}
              flashActive={tour.flashActive}
              visibleItemCount={tour.visibleItemCount}
              displayConfidence={tour.displayConfidence}
              extractionComplete={tour.extractionComplete}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {tour.step === "intro" ? (
              <>
                <DialogPrimitive.Close render={<Button variant="outline" />}>
                  Fechar
                </DialogPrimitive.Close>
                <Button onClick={tour.goToCapture}>Iniciar simulação</Button>
              </>
            ) : null}

            {tour.step === "capture" ? (
              <>
                <DialogPrimitive.Close render={<Button variant="outline" />}>
                  Fechar
                </DialogPrimitive.Close>
                <Button onClick={tour.simulateCapture}>Simular captura</Button>
              </>
            ) : null}

            {tour.step === "extracting" ? (
              <Button disabled>
                Extraindo dados…
              </Button>
            ) : null}

            {tour.step === "result" ? (
              <>
                <DialogPrimitive.Close render={<Button variant="outline" />}>
                  Fechar
                </DialogPrimitive.Close>
                <Button onClick={tour.goToCta}>Ver no dashboard</Button>
              </>
            ) : null}

            {tour.step === "cta" ? (
              <>
                <DialogPrimitive.Close render={<Button variant="outline" />}>
                  Fechar
                </DialogPrimitive.Close>
                <Button render={<Link href={registerHref} />}>Solicitar acesso</Button>
              </>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
