import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable";
import { RatingBadge } from "src/core/components/RatingBadge";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";



import { AnalysisMetrics } from "src/pages/Video/components/AnalysisMetrics"
import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable"
import type { VideoAnalysisResponse } from "src/pages/Upload/types"

type AnalysisResultsProps = {
    state: "idle" | "loading" | "ready" | "pending" | "error";
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null;
};

export function AnalysisResults({ state, summary }: AnalysisResultsProps) {
    if (state === "loading" || state === "pending") {
        return (
            <section className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Resultados da Análise
                </h3>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    Processando análise. Os resultados aparecerão aqui quando terminar.
                </p>
            </section>
        );
    }

    if (!summary) {
        return (
            <section className="flex flex-col gap-3">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Resultados da Análise
                </h3>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    Não há uma análise disponível para este vídeo.
                </p>
            </section>
        );
    }

    return (
        <>
            {summary.content_rating && (
                <div className="p-5 mb-6 border rounded-2xl border-[var(--border)] bg-[var(--surface)]">
                    <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-[var(--muted)]">
                        Classificação Sugerida
                    </h3>

                    <RatingBadge
                        level={summary.content_rating.danger_level}
                        label={summary.content_rating.rating_label}
                    />

                    {summary.content_rating.danger_level > 1 && (
                        <p className="mt-3 text-sm text-[var(--muted)]">

                            <strong>Motivo:</strong> Presença de {summary.content_rating.trigger_objects.join(', ')}.
                        </p>
                    )}
                </div>
            )}
            <section className="flex flex-col gap-4">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Resultados da Análise
                </h3>
                <AnalysisDetectionTable summary={summary} />
            </section>
        </>
    );
}
