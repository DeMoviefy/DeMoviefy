// src/pages/Dashboard/components/ProcessingQueuePanel.tsx

import { useState } from "react";
import { FaRegClock } from "react-icons/fa";

import { toast } from "sonner";

import { StatusBadge } from "src/core/components/StatusBadge";
import { getApiErrorMessage } from "src/core/utils/videoHelpers";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { VideoUploadService } from "src/pages/Dashboard/services/videoUploadService";

export function ProcessingQueuePanel() {
  const videos = useProcessingStore((state) => state.videos);

  const [cancellingVideoId, setCancellingVideoId] = useState<number | null>(
    null
  );
  const processingVideos = videos.filter(
    (v) => v.status === "PROCESSANDO" || v.status === "PROCESSANDO_IA"
  );

  async function cancelProcessing(videoId: number) {
    setCancellingVideoId(videoId);

    try {
      await VideoUploadService.cancelProcessing(videoId);

      toast.success("Processamento cancelado. O vídeo foi mantido.");

      await useProcessingStore.getState().refresh();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível cancelar o processamento."
        )
      );
    } finally {
      setCancellingVideoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Fila de processamento
          </h2>
        </div>

        <p className="mt-1.5 text-sm leading-6 text-neutral-500">
          Acompanhe os vídeos que estão sendo processados.
        </p>
      </div>

      {processingVideos.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-neutral-900">
            Nenhum vídeo na fila
          </p>

          <p className="mt-2 max-w-full text-sm leading-6 text-neutral-500">
            Os vídeos em processamento aparecerão aqui.
          </p>
          <FaRegClock
            aria-hidden="true"
            className="mt-4 size-6 text-neutral-400"
          />
        </div>
      ) : (
        <div
          className="max-h-96 overflow-y-auto pr-2"
          role="region"
          aria-label="Vídeos em processamento"
          tabIndex={0}
        >
          <div className="flex flex-col gap-4">
            {processingVideos.map((video) => (
              <div
                key={video.id}
                className="flex min-h-48 flex-col justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div
                      className="truncate text-sm font-semibold text-neutral-900"
                      title={video.filename}
                    >
                      {video.filename}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-neutral-600">
                      <span>{video.ai_config.model_name}</span>
                    </div>
                  </div>

                  <StatusBadge status={video.status} />
                </div>

                <div className="mt-5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${video.processing.processing_progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-4 text-xs text-neutral-500">
                    <span className="min-w-0 truncate">
                      {video.processing.processing_message}
                    </span>

                    <span className="shrink-0 font-semibold tabular-nums text-neutral-700">
                      {video.processing.processing_progress}%
                      {video.processing.processing_eta_seconds !== null &&
                        ` · ~${video.processing.processing_eta_seconds}s`}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-5 cursor-pointer rounded-md bg-red-50 px-2 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={cancellingVideoId === video.id}
                    onClick={() => void cancelProcessing(video.id)}
                  >
                    {cancellingVideoId === video.id
                      ? "Cancelando..."
                      : "Cancelar processamento"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
