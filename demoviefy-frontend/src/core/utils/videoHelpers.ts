// src/pages/Dashboard/utils/helpers.ts

import type { AxiosError } from "axios";

import type {
    AIModelOption,
    AITaskOption,
    VideoRecord,
    VideoAnalysisVariant,
    VideoTranscriptionResponse,
} from "src/core/types/videoTypes";

// Transforma em JSON

export function prettifyJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

// Pega o erro do axios e o retorna

export function getApiErrorMessage(error: unknown, fallback: string) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return axiosError.response?.data?.error ?? axiosError.response?.data?.message ?? fallback;
}

// Retorna o caminho relativo do diretório para o primeiro modelo encontrado para uma determinada tarefa.

export function chooseFirstModel(models: AIModelOption[], taskType: string): string {
    return models.find((model) => model.task_type === taskType)?.relative_path ?? "";
}

// Define que a tarefa padrão para os modelos é a detecção de objetos.

export function choosePreferredTask(tasks: AITaskOption[]): string {
    return tasks.find((task) => task.task_type === "object_detection")?.task_type ?? tasks[0]?.task_type ?? "object_detection";
}

// Cria uma assinatura única baseada no estado e configurações do vídeo para controlar o cache do useEffect.

export function buildArtifactSignature(video: VideoRecord | null, variantId: string | null) {
    if (!video) {
        return "empty";
    }

    return [
        video.id,
        video.status,
        video.analysis_ready,
        video.transcription_ready,
        video.storage.annotated_exists,
        video.ai_config.task_type,
        video.ai_config.model_relative_path,
        video.ai_config.frame_stride,
        video.ai_config.confidence_threshold,
        video.ai_config.max_frames,
        video.ai_config.clip_start_sec,
        video.ai_config.clip_end_sec ?? "end",
        variantId ?? "latest",
    ].join("|");
}

// Formata horas

export function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const remaining = safe % 60
  return hours > 0
    ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`
    : `${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`
}

function formatSubtitleTimestamp(seconds: number, separator: "," | "."): string {
    const milliseconds = Math.max(0, Math.round(seconds * 1000));
    const hours = Math.floor(milliseconds / 3_600_000);
    const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
    const remainingSeconds = Math.floor((milliseconds % 60_000) / 1000);
    const remainder = milliseconds % 1000;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}${separator}${String(remainder).padStart(3, "0")}`;
}

export function formatSrtTime(seconds: number): string {
    return formatSubtitleTimestamp(seconds, ",");
}

export function formatVttTime(seconds: number): string {
    return formatSubtitleTimestamp(seconds, ".");
}

export function createWebVtt(segments: VideoTranscriptionResponse["transcription"]["segments"]): string {
    const cues = segments
        .filter((segment) => segment.text.trim() && segment.end > segment.start)
        .map((segment) => {
            const text = segment.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `${formatVttTime(segment.start)} --> ${formatVttTime(segment.end)}\n${text}`;
        });
    return `WEBVTT\n\n${cues.join("\n\n")}`;
}

export function formatPercent(value: number | undefined) {
  if (typeof value !== "number") {
    return "-";
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSeconds(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(1)}s`;
}

export function formatVariantLabel(variant: VideoAnalysisVariant) {
  const createdAt = variant.created_at ? new Date(variant.created_at).toLocaleString() : "Sem data";
  return `${variant.task_label} - ${variant.model_name} - ${createdAt}`;
}
