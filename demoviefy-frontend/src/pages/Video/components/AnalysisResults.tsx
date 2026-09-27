import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";

type AnalysisResultsProps = {
    state: "idle" | "loading" | "ready" | "pending" | "error";
    summary: NonNullable<VideoAnalysisResponse["analysis"]> | null;
};

export function AnalysisResults({ state, summary }: AnalysisResultsProps) {
    if (state === "loading" || state === "pending") {
        return (
            <section className="flex flex-col gap-6">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                    Resultados da Análise
                </h3>
                <p className="text-sm leading-6 text-neutral-500" aria-live="polite">
                    Processando análise. Os resultados aparecerão aqui quando terminar.
                </p>
            </section>
        );
    }

    if (!summary) {
        return (
            <section className="flex flex-col gap-6">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                    Resultados da Análise
                </h3>
                <p className="text-sm leading-6 text-neutral-500" aria-live="polite">
                    Não há uma análise disponível para este vídeo.
                </p>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-6">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                Resultados da Análise
            </h3>
            <AnalysisDetectionTable summary={summary} />
        </section>
    );
}
