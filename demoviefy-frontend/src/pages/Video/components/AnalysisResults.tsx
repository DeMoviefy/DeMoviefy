// src/pages/Upload/components/AnalysisResults.tsx

import { AnalysisMetrics } from "src/pages/Video/components/AnalysisMetrics"
import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable"
import type { VideoAnalysisResponse } from "src/pages/Upload/types"
import { RatingBadge } from "src/core/components/RatingBadge";

type AnalysisResultsProps = {
  state: "idle" | "loading" | "ready" | "pending" | "error"
  summary: NonNullable<VideoAnalysisResponse["analysis"]> | null
  taskLabel: string
  modelName: string
}

export function AnalysisResults({
  state,
  summary,
  taskLabel,
  modelName,
}: AnalysisResultsProps) {
  if (state === "loading") {
    return <div className="skeleton-block" />
  }

  if (!summary) {
    return null
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

      <AnalysisMetrics
        summary={summary}
        taskLabel={taskLabel}
        modelName={modelName}
      />
      <AnalysisDetectionTable summary={summary} />
    </>
  )
}