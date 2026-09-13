"use client";

import { BarChart3, Camera, CheckCircle2, FileText, Loader2 } from "lucide-react";

import { DemoDashboardSnippet } from "@/components/landing/demo-tour/demo-dashboard-snippet";
import { DemoReceiptMock } from "@/components/landing/demo-tour/demo-receipt-mock";
import { ConfidenceBadge } from "@/components/invoices/confidence-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEMO_CATEGORY_LABELS,
  DEMO_SCENARIO,
  type DemoTourStep,
} from "@/lib/demo/demo-scenario";
import { formatCnpj, formatCurrency, formatDate } from "@/lib/format";

type DemoTourStepsProps = {
  step: DemoTourStep;
  flashActive: boolean;
  visibleItemCount: number;
  displayConfidence: number;
  extractionComplete: boolean;
};

export function DemoIntroStep() {
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-base leading-relaxed text-muted-foreground">
        Veja como o PassaNota transforma uma nota fiscal em dados estruturados e visibilidade de
        gastos — tudo com dados fictícios, sem enviar nada ao servidor.
      </p>
      <ol className="space-y-3 text-sm">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            1
          </span>
          <span>
            <strong className="font-medium text-foreground">Capturar</strong> — simule a foto de um
            cupom fiscal.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            2
          </span>
          <span>
            <strong className="font-medium text-foreground">Extrair</strong> — a IA lê emitente,
            itens e valores com percentual de confiança.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            3
          </span>
          <span>
            <strong className="font-medium text-foreground">Analisar</strong> — a nota entra no
            dashboard de gastos da empresa.
          </span>
        </li>
      </ol>
    </div>
  );
}

export function DemoCaptureStep({ flashActive }: { flashActive: boolean }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Na plataforma, você fotografa com a câmera do computador ou celular, ou envia um arquivo.
      </p>
      <DemoReceiptMock flashActive={flashActive} />
    </div>
  );
}

export function DemoExtractingStep({
  visibleItemCount,
  displayConfidence,
  extractionComplete,
}: Pick<DemoTourStepsProps, "visibleItemCount" | "displayConfidence" | "extractionComplete">) {
  const visibleItems = DEMO_SCENARIO.items.slice(0, visibleItemCount);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-primary/20">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Processamento da nota</p>
              <p className="font-mono text-xs text-muted-foreground">simulação-local</p>
            </div>
            {extractionComplete ? (
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                Processada
              </Badge>
            ) : (
              <Badge variant="outline">Pendente</Badge>
            )}
          </div>

          {!extractionComplete ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Analisando imagem com IA…
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Confiança da extração</span>
            <ConfidenceBadge value={displayConfidence} />
          </div>

          {visibleItems.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleItems.map((item) => (
                    <TableRow key={item.description} className="animate-fade-in">
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatCurrency(String(item.totalPrice))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function DemoResultStep() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Nota processada</AlertTitle>
        <AlertDescription>
          {DEMO_SCENARIO.items.length} itens extraídos · Total{" "}
          {formatCurrency(String(DEMO_SCENARIO.total))}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Emitente
          </p>
          <p className="font-medium">{DEMO_SCENARIO.emitter}</p>
          <p className="text-sm text-muted-foreground">{formatCnpj(DEMO_SCENARIO.cnpj)}</p>
        </div>
        <div className="space-y-1 rounded-lg border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resumo
          </p>
          <p className="text-sm text-muted-foreground">
            Emissão: {formatDate(DEMO_SCENARIO.issuedAt)}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-lg font-semibold">
              {formatCurrency(String(DEMO_SCENARIO.total))}
            </p>
            <ConfidenceBadge value={DEMO_SCENARIO.confidence} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_SCENARIO.items.map((item) => (
              <TableRow key={item.description}>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{DEMO_CATEGORY_LABELS[item.category]}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(String(item.totalPrice))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DemoCtaStep() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Impacto no dashboard</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          A nota simulada entra automaticamente nos totais e gráficos da empresa.
        </p>
      </div>
      <DemoDashboardSnippet />
      <p className="text-center text-base font-medium">
        Quer testar com as notas da sua empresa?
      </p>
      <p className="text-center text-sm text-muted-foreground">
        O acesso completo é liberado sob convite. Entre em contato e montamos um teste na sua
        operação.
      </p>
    </div>
  );
}

export const DEMO_STEP_ICONS = {
  intro: Camera,
  capture: Camera,
  extracting: FileText,
  result: FileText,
  cta: BarChart3,
} as const;

export function DemoTourStepContent(props: DemoTourStepsProps) {
  switch (props.step) {
    case "intro":
      return <DemoIntroStep />;
    case "capture":
      return <DemoCaptureStep flashActive={props.flashActive} />;
    case "extracting":
      return (
        <DemoExtractingStep
          visibleItemCount={props.visibleItemCount}
          displayConfidence={props.displayConfidence}
          extractionComplete={props.extractionComplete}
        />
      );
    case "result":
      return <DemoResultStep />;
    case "cta":
      return <DemoCtaStep />;
    default:
      return null;
  }
}
