// src/core/components/ProcessingProgress.tsx

import { memo } from "react";
import { useTranslation } from "react-i18next";
import { getAnalyzingFrameProgress, getVideoModelSizeTranslationKey } from "src/core/utils/videoHelpers";

type ProcessingProgressProps = {
  modelName: string;
  progress: number;
  stage: string;
  etaSeconds: number | null;
  message: string | null;
};

export const ProcessingProgress = memo(function ProcessingProgress({
  modelName,
  progress,
  stage,
  etaSeconds,
  message,
}: ProcessingProgressProps) {
  const { t } = useTranslation();
  const modelTranslationKey = getVideoModelSizeTranslationKey(modelName);
  const localizedModelName = modelTranslationKey ? t(modelTranslationKey) : modelName;
  const stageLabels: Record<string, string> = {
    queued: t("queued"), preparing: t("preparingVideo"), analyzing: t("analyzingVideo"),
    analysis_complete: t("analysisComplete"), transcribing: t("transcribingVideo"),
    transcription_skipped: t("transcriptionSkipped"), completed: t("processingCompleted"),
    cancelled: t("statusCancelled"), error: t("processingError"),
  };
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const frameProgress = getAnalyzingFrameProgress(message);
  const statusMessage = frameProgress
    ? t("analyzingFrames", frameProgress)
    : stageLabels[stage] || message || stage;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-800">
      <p className="mb-3 truncate text-xs font-medium text-neutral-600 dark:text-neutral-300" title={`${t("analysis")}: ${localizedModelName}`}>
        {t("analysis")}: {localizedModelName}
      </p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
        role="progressbar"
        aria-label={t("processingProgress")}
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

        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap tabular-nums">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {safeProgress}%
          </span>
          {etaSeconds !== null && (
            <span className="text-neutral-500 dark:text-neutral-400">
              ~{etaSeconds}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
