// src/pages/Dashboard/components/AnalysisMetrics.tsx

import { memo } from "react"
import { formatSeconds } from "src/core/utils/videoHelpers"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisMetricsProps = {
  summary: NonNullable<VideoAnalysisResponse["analysis"]>
  taskLabel: string
  modelName: string
}

export const AnalysisMetrics = memo(function AnalysisMetrics({
  summary,
  taskLabel,
  modelName,
}: AnalysisMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
      <div>
        <span className="text-xs font-medium text-neutral-500">
          Detecções
        </span>
        <strong className="mt-1 block text-xl font-semibold">
          {summary.total_detections}
        </strong>
      </div>
  
      <div>
        <span className="text-xs font-medium text-neutral-500">
          Frames amostrados
        </span>
        <strong className="mt-1 block text-xl font-semibold">
          {summary.sampled_frames}
        </strong>
      </div>
  
      <div>
        <span className="text-xs font-medium text-neutral-500">
          Stride / limite
        </span>
        <strong className="mt-1 block text-sm font-semibold text-neutral-900">
          {summary.frame_stride} / {summary.max_frames}
        </strong>
      </div>
  
      <div>
        <span className="text-xs font-medium text-neutral-500">
          Tarefa
        </span>
        <strong className="mt-1 block truncate text-sm font-semibold text-neutral-900">
          {taskLabel}
        </strong>
      </div>
  
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
  )
})