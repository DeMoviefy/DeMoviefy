// src/pages/Dashboard/components/ProcessingQueuePanel.tsx

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { StatusBadge } from "src/core/components/StatusBadge";
import { getApiErrorMessage } from "src/core/utils/videoHelpers";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { VideoUploadService } from "src/pages/Dashboard/services/videoUploadService";

const VIDEOS_PER_PAGE = 2;

export function ProcessingQueuePanel() {
  const videos = useProcessingStore((state) => state.videos);

  const [cancellingVideoId, setCancellingVideoId] = useState<number | null>(
    null
  );
  const [page, setPage] = useState(1);

  const processingVideos = videos.filter(
    (v) => v.status === "PROCESSANDO" || v.status === "PROCESSANDO_IA"
  );
  const totalPages = Math.ceil(processingVideos.length / VIDEOS_PER_PAGE);
  const visiblePageCount = Math.min(totalPages, 5);
  const pageWindowStart = Math.min(
    Math.max(page - Math.floor(visiblePageCount / 2), 1),
    Math.max(totalPages - visiblePageCount + 1, 1),
  );
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => pageWindowStart + index,
  );
  const visibleVideos = processingVideos.slice(
    (page - 1) * VIDEOS_PER_PAGE,
    page * VIDEOS_PER_PAGE,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(totalPages, 1));
    }
  }, [page, totalPages]);

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
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-neutral-900">
            Nenhum vídeo em processamento
          </p>

          <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
            Assim que um vídeo começar a ser processado, ele aparecerá aqui
            para você acompanhar o progresso.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleVideos.map((video) => (
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
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Paginação da fila de processamento"
          className="flex items-center justify-between gap-2 pt-4"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            aria-label="Página anterior"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <FaChevronLeft aria-hidden="true" className="size-3" />
          </button>

          <div className="flex shrink-0 items-center gap-1" aria-label="Selecionar página">
            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={`Página ${pageNumber}`}
                className={`h-7 min-w-7 cursor-pointer rounded-md px-2 text-xs font-medium transition-colors ${
                  pageNumber === page
                    ? "bg-blue-600 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
            aria-label="Próxima página"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <FaChevronRight aria-hidden="true" className="size-3" />
          </button>
        </nav>
      )}
    </section>
  );
}
