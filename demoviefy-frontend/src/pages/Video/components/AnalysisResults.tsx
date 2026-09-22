// src/pages/Dashboard/components/AnalysisResults.tsx

import { AnalysisMetrics } from "src/pages/Video/components/AnalysisMetrics"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"
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
  // 1. Se estiver carregando, devolvemos o skeleton
  if (state === "loading") {
    return (
      <div className="flex flex-col gap-4" aria-label="Carregando análise">
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-40 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    )
  }

  // 2. Se a análise terminou mas não tem resumo válido, não renderizamos nada
  if (!summary) {
    return null
  }

  // 3. Se deu tudo certo, exibimos os dois componentes que acabamos de criar!
  return (
    <AnalysisMetrics
      summary={summary}
      taskLabel={taskLabel}
      modelName={modelName}
    />

  )
}