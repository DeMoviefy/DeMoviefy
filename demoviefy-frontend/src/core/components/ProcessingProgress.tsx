// src/core/components/ProcessingProgress.tsx

import { memo } from "react";

type ProcessingProgressProps = {
  progress: number;
  stage: string;
  etaSeconds: number | null;
  message: string | null;
};

const PIPELINE_STEPS = [
  { id: "queued", label: "Fila" },
  { id: "preparing", label: "Preparação" },
  { id: "analyzing", label: "Análise" },
  { id: "completed", label: "Concluído" },
] as const;

const STAGE_INDEX: Record<string, number> = {
  idle: -1,
  queued: 0,
  preparing: 1,
  analyzing: 2,
  analysis_complete: 2,
  transcribing: 2,
  transcription_skipped: 2,
  completed: 3,
  error: 3,
};

function formatEta(value: number | null) {
  if (value === null || value <= 0) {
    return "Finalizando...";
  }

  if (value < 60) {
    return `~${value}s restantes`;
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `~${minutes}m ${seconds}s restantes`;
}

export const ProcessingProgress = memo(function ProcessingProgress({
  progress,
  stage,
  etaSeconds,
  message,
}: ProcessingProgressProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const currentIndex = STAGE_INDEX[stage] ?? -1;

  const currentStep = PIPELINE_STEPS.find((item) => item.id === stage)?.label ?? stage;
  const displayStage = currentStep === "completed" ? "Concluído" : currentStep;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <strong className="text-lg font-semibold tabular-nums text-blue-700">{safeProgress}%</strong>
          <span className="text-sm font-medium text-neutral-700">{displayStage}</span>
        </div>
        <span className="text-xs text-neutral-500">{formatEta(etaSeconds)}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100" aria-hidden="true">
        <span className="block h-full rounded-full bg-blue-600 transition-all" style={{ width: `${safeProgress}%` }} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2" aria-label="Etapas do processamento">
        {PIPELINE_STEPS.map((step, index) => {
          const isDone = index < currentIndex || stage === "completed";
          const isCurrent = stage === step.id || (stage === "error" && index === Math.max(currentIndex, 0));

          return (
            <span
              key={step.id}
              className={`flex items-center gap-1.5 text-xs ${isCurrent ? "font-semibold text-blue-700" : isDone ? "font-medium text-blue-600" : "text-neutral-400"}`}
            >
              <span className={`size-2 rounded-full ${isDone || isCurrent ? "bg-blue-600" : "bg-neutral-300"}`} />
              <span>{step.label}</span>
            </span>
          );
        })}
      </div>

      <small className="mt-3 block text-xs leading-5 text-neutral-500">{message ?? "Aguardando próximo status..."}</small>
    </div>
  );
});
