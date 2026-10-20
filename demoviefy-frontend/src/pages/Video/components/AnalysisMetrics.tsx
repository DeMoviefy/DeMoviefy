// src/pages/Dashboard/components/AnalysisMetrics.tsx

import { memo } from "react"
import { useTranslation } from "react-i18next";
import { formatSeconds } from "src/core/utils/videoHelpers"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisMetricsProps = {
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null
    modelName: string
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
                            {t("model")}
                        </span>
                        <strong
                            className="mt-1 block truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                            title={modelName}
                        >
                            {modelName}
                        </strong>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {t("clipLabel")}
                        </span>
                        <strong className="mt-1 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatSeconds(summary.clip_start_sec)} -{" "}
                            {summary.clip_end_sec === null
                                ? t("endOfVideo")
                                : formatSeconds(summary.clip_end_sec)}
                        </strong>
                    </div>

                </div>
            )}
        </div>
    );
})
