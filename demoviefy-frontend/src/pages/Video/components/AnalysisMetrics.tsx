// src/pages/Dashboard/components/AnalysisMetrics.tsx

import { memo } from "react"
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
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                Detalhes da análise
            </h3>

            {!summary ? (
                <p className="text-xs leading-5 text-neutral-400" aria-live="polite">
                    Métricas indisponíveis sem uma análise.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
                    <div>
                        <span className="text-xs font-medium text-neutral-500">
                            Modelo
                        </span>
                        <strong
                            className="mt-1 block truncate text-sm font-semibold text-neutral-900"
                            title={modelName}
                        >
                            {modelName}
                        </strong>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-neutral-500">
                            Trecho
                        </span>
                        <strong className="mt-1 block text-sm font-semibold text-neutral-900">
                            {formatSeconds(summary.clip_start_sec)} -{" "}
                            {summary.clip_end_sec === null
                                ? "fim"
                                : formatSeconds(summary.clip_end_sec)}
                        </strong>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-neutral-500">
                            Confiança mínima
                        </span>
                        <strong className="mt-1 block text-sm font-semibold text-neutral-900">
                            {typeof summary.confidence_threshold === "number"
                                ? `${(summary.confidence_threshold * 100).toFixed(0)}%`
                                : "-"}
                        </strong>
                    </div>
                </div>
            )}
        </section>
    );
})
