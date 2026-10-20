// src/pages/Dashboard/components/AnalysisMetrics.tsx

import { memo } from "react"
import { formatVideoModelName } from "src/core/utils/videoHelpers"
import { useTranslation } from "react-i18next";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisMetricsProps = {
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null
    modelName: string
}

function formatClipTime(value: number | null, videoDuration: number | null): string {
    if (value === null || !Number.isFinite(value)) return "-";
    const totalSeconds = Math.max(0, Math.floor(value));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (part: number) => String(part).padStart(2, "0");

    if (videoDuration !== null && videoDuration >= 3600) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(Math.floor(totalSeconds / 60))}:${pad(seconds)}`;
}

export const AnalysisMetrics = memo(function AnalysisMetrics({
    summary,
    modelName,
}: AnalysisMetricsProps) {
    const { t } = useTranslation();
    return (
        <div>
            {!summary ? (
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    {t("analysisUnavailableShort")}
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {t("analysisAccuracy")}
                        </span>
                        <strong
                            className="mt-1 block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                            title={formatVideoModelName(modelName)}
                        >
                            {formatVideoModelName(modelName)}
                        </strong>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {t("clipLabel")}
                        </span>
                        <strong className="mt-1 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatClipTime(summary.clip_start_sec, summary.video_duration_sec)} -{" "}
                            {formatClipTime(summary.clip_end_sec ?? summary.video_duration_sec, summary.video_duration_sec)}
                        </strong>
                    </div>

                </div>
            )}
        </div>
    );
})
