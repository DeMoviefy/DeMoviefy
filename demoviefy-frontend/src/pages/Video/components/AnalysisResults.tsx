import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable";
import { RatingBadge } from "src/core/components/RatingBadge";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";


type AnalysisResultsProps = {
    state: "idle" | "loading" | "ready" | "pending" | "error";
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null;
};

export function AnalysisResults({ state, summary }: AnalysisResultsProps) {
    if (state === "loading" || state === "pending") {
        return (
            <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Resultados da análise
                </h3>
                <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400" aria-live="polite">
                    Processando análise. Os resultados aparecerão aqui quando terminar.
                </p>
            </section>
        );
    }

    if (!summary) {
        return (
            <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Resultados da análise
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
                <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/70 sm:p-5">
                    <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        Classificação sugerida
                    </h3>

                    <RatingBadge
                        level={summary.content_rating.danger_level}
                        label={summary.content_rating.rating_label}
                    />

                    {summary.content_rating.danger_level > 1 && (
                        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            <strong className="font-semibold text-neutral-800 dark:text-neutral-100">Motivo:</strong>{" "}
                            Presença de {summary.content_rating.trigger_objects.join(", ")}.
                        </p>
                    )}
                </div>
            )}
            <AnalysisDetectionTable summary={summary} heading="Resultados da Análise" />
        </>
    );
}
