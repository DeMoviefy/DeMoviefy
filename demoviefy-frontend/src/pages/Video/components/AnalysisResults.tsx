// src/pages/Upload/components/AnalysisResults.tsx

import { AnalysisMetrics } from "src/pages/Video/components/AnalysisMetrics"
import { AnalysisDetectionTable } from "src/pages/Video/components/AnalysisDetectionTable"
import type { VideoAnalysisResponse } from "src/pages/Upload/types"

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

      <AnalysisMetrics
        summary={summary}
        taskLabel={taskLabel}
        modelName={modelName}
      />
      <AnalysisDetectionTable summary={summary} />
    </>
  )
}