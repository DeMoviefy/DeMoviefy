import { useTranslation } from "react-i18next";
import { getYoloClassLabel } from "src/core/utils/yoloClassLabels";
import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable";
import { RatingBadge } from "src/core/components/RatingBadge";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";


type AnalysisResultsProps = {
    state: "idle" | "loading" | "ready" | "pending" | "error";
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null;
};

export function AnalysisResults({ state, summary }: AnalysisResultsProps) {
    const { t, i18n } = useTranslation();
    if (state === "loading" || state === "pending") {
        return (
            <section className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70">
                <h3 className="bg-neutral-100 px-4 pb-4 pt-5 text-base font-semibold tracking-tight text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 sm:px-5 sm:pb-5 sm:pt-5">
                    {t("analysisResults")}
                </h3>
                <div className="flex h-176 items-start overflow-auto bg-white dark:bg-neutral-800">
                    <p className="px-5 py-8 text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                        {t("processingAnalysis")}
                    </p>
                </div>
            </section>
        );
    }

    if (!summary) {
        return (
            <section className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70">
                <h3 className="bg-neutral-100 px-4 pb-4 pt-5 text-base font-semibold tracking-tight text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 sm:px-5 sm:pb-5 sm:pt-5">
                    {t("analysisResults")}
                </h3>
                <div className="h-176 overflow-auto bg-white dark:bg-neutral-800">
                    <p className="px-5 py-8 text-sm text-neutral-400 dark:text-neutral-500" aria-live="polite">
                        {t("unavailableAnalysis")}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <>
            {summary.content_rating && (
                <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/70 sm:p-5">
                    <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {t("suggestedRating")}
                    </h3>

                    <RatingBadge
                        level={summary.content_rating.danger_level}
                        label={summary.content_rating.rating_label}
                    />

                    {summary.content_rating.danger_level > 1 && (
                        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            <strong className="font-semibold text-neutral-800 dark:text-neutral-100">{t("reason")}</strong>{" "}
                            {summary.content_rating.trigger_objects.map((label) => getYoloClassLabel(label, i18n.resolvedLanguage ?? i18n.language)).join(", ")}.
                        </p>
                    )}
                </div>
            )}
            <AnalysisDetectionTable summary={summary} heading={t("analysisResults")} />
        </>
    );
}
