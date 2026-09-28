// src/core/components/ProcessingProgress.tsx

import { memo } from "react";

type ProcessingProgressProps = {
  modelName: string;
  progress: number;
  stage: string;
  etaSeconds: number | null;
  message: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  queued: "Na fila",
  preparing: "Preparando vídeo",
  analyzing: "Analisando vídeo",
  analysis_complete: "Análise concluída",
  transcribing: "Transcrevendo vídeo",
  transcription_skipped: "Transcrição ignorada",
  completed: "Concluído",
  error: "Erro no processamento",
};

export const ProcessingProgress = memo(function ProcessingProgress({
  modelName,
  progress,
  stage,
  etaSeconds,
  message,
}: ProcessingProgressProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const statusMessage = message || STAGE_LABELS[stage] || stage;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800">
      <p className="mb-3 truncate text-xs font-medium text-neutral-600 dark:text-neutral-300" title={modelName}>
        {modelName}
      </p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
        role="progressbar"
        aria-label="Progresso do processamento"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeProgress}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-800"
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      <div className="mt-2 flex items-start justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="min-w-0 truncate" aria-live="polite">
          {statusMessage}
        </span>

        <span className="shrink-0 font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
          {safeProgress}%
          {etaSeconds !== null && ` · ~${etaSeconds}s`}
        </span>
      </div>
    </div>
  );
});
