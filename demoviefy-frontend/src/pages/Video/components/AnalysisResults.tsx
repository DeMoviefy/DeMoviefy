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
            <section className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t("analysisResults")}
                </h3>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    {t("processingAnalysis")}
                </p>
            </section>
        );
    }

    if (!summary) {
        return (
            <section className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t("analysisResults")}
                </h3>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    {t("unavailableAnalysis")}
                </p>
            </section>
        );
    }

    return (
        <>
            {summary.content_rating && (
                <div className="p-5 mb-6 border rounded-2xl border-(--border) bg-(--surface)">
                    <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-(--muted)">
                        {t("suggestedRating")}
                    </h3>

                    <RatingBadge
                        level={summary.content_rating.danger_level}
                        label={summary.content_rating.rating_label}
                    />

                    {summary.content_rating.danger_level > 1 && (
                        <p className="mt-3 text-sm text-(--muted)">

                            <strong>{t("reason")}</strong> {summary.content_rating.trigger_objects.map((label) => getYoloClassLabel(label, i18n.resolvedLanguage ?? i18n.language)).join(", ")}.
                        </p>
                    )}
                </div>
            )}
            <section className="flex flex-col gap-4">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t("analysisResults")}
                </h3>
                <AnalysisDetectionTable summary={summary} />
            </section>
        </>
    );
}
