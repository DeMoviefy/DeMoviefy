// src/pages/Dashboard/components/VideoPreviewPanel.tsx

import { useState, useEffect, type RefObject } from "react"
import type { VideoRecord } from "src/core/types/videoTypes"

interface VideoPreviewPanelProps {
  video: VideoRecord
  analysisState: "idle" | "loading" | "ready" | "pending" | "error"
  originalVideoSrc: string
  annotatedVideoSrc: string
  videoRef: RefObject<HTMLVideoElement | null>
  hasSelectedAnalysis: boolean
}

function getAnnotatedPreviewState(
  annotatedPlaybackError: boolean,
  isReprocessing: boolean,
  analysisState: string,
  hasSelectedAnalysis: boolean,
) {
  if (isReprocessing) {
    return {
      title: "Vídeo sendo processado.",
      message: "O vídeo está sendo processado com uma nova configuração. O preview anotado estará disponível quando terminar.",
    };
  }
  if (annotatedPlaybackError && hasSelectedAnalysis) {
    return {
      title: "Não foi possível reproduzir o vídeo anotado.",
      message: "O preview anotado foi gerado, mas falhou ao abrir no navegador. Reprocesse o vídeo para regenerar um MP4 compatível ou abra o arquivo salvo em uma nova guia.",
    };
  }
  if (analysisState === "pending") {
    return {
      title: "Vídeo anotado ainda não disponível.",
      message: "A IA ainda está processando o arquivo. Quando terminar, o preview anotado aparece aqui.",
    };
  }
  return {
    title: "Vídeo anotado indisponível.",
    message: "Não há uma análise disponível para este vídeo.",
  };
}

export function VideoPreviewPanel({
  video,
  analysisState,
  annotatedVideoSrc,
  hasSelectedAnalysis
}: VideoPreviewPanelProps) {
  const [annotatedPlaybackError, setAnnotatedPlaybackError] = useState(false)

  useEffect(() => {
    setAnnotatedPlaybackError(false);
  }, [annotatedVideoSrc, video?.id, video?.status]);
  const isReprocessing = video.status.startsWith("PROCESSANDO");
  const canTryAnnotated = hasSelectedAnalysis && !annotatedPlaybackError;
  const previewState = getAnnotatedPreviewState(
    annotatedPlaybackError,
    isReprocessing,
    analysisState,
    hasSelectedAnalysis,
  );

  return (
    <div className="flex flex-col gap-6">
      <article className="overflow-hidden rounded-xl border border-neutral-200 bg-black">
        {canTryAnnotated ? (
          <video
            key={annotatedVideoSrc}
            className="aspect-video w-full object-contain"
            controls
            preload="metadata"
            src={annotatedVideoSrc}
            onError={() => setAnnotatedPlaybackError(true)}
          >
            Seu navegador não suporta reproduzir este vídeo.
          </video>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center bg-neutral-50 px-8 text-center">
            <strong className="text-sm font-semibold text-neutral-900">
              {previewState.title}
            </strong>

            <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">
              {previewState.message}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}