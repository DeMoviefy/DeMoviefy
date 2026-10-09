import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { StatusBadge } from "src/core/components/StatusBadge";
import type { VideoRecord } from "src/core/types/videoTypes";

type DashboardVideoLibraryProps = {
  videos: VideoRecord[];
};

const DEFAULT_VIDEOS_PER_PAGE = 4;
const WIDE_SCREEN_VIDEOS_PER_PAGE = 6;

function formatDate(createdAt: string | null) {
  if (!createdAt) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(createdAt));
}


export const DashboardVideoLibrary = memo(
  function DashboardVideoLibrary({
    videos,
  }: DashboardVideoLibraryProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [videosPerPage, setVideosPerPage] = useState(DEFAULT_VIDEOS_PER_PAGE);

    useEffect(() => {
      const wideScreen = window.matchMedia("(min-width: 1280px)");
      const updatePageSize = () => {
        setVideosPerPage(
          wideScreen.matches
            ? WIDE_SCREEN_VIDEOS_PER_PAGE
            : DEFAULT_VIDEOS_PER_PAGE,
        );
      };

      updatePageSize();
      wideScreen.addEventListener("change", updatePageSize);

      return () => wideScreen.removeEventListener("change", updatePageSize);
    }, []);

    const filteredVideos = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();

      if (!normalizedSearch) {
        return videos;
      }

      return videos.filter((video) =>
        video.filename.toLowerCase().includes(normalizedSearch),
      );
    }, [videos, search]);

    const totalPages = Math.max(
      1,
      Math.ceil(filteredVideos.length / videosPerPage),
    );
    const visiblePageCount = Math.min(totalPages, 5);
    const pageWindowStart = Math.min(
      Math.max(page - Math.floor(visiblePageCount / 2), 1),
      Math.max(totalPages - visiblePageCount + 1, 1),
    );
    const visiblePages = Array.from(
      { length: visiblePageCount },
      (_, index) => pageWindowStart + index,
    );

    const visibleVideos = useMemo(() => {
      const startIndex = (page - 1) * videosPerPage;

      return filteredVideos.slice(
        startIndex,
        startIndex + videosPerPage,
      );
    }, [filteredVideos, page, videosPerPage]);

    useEffect(() => {
      setPage(1);
    }, [search]);

    useEffect(() => {
      if (page > totalPages) {
        setPage(totalPages);
      }
    }, [page, totalPages]);

    return (
      <section className="flex min-h-0 flex-1 flex-col pr-8 pb-2">
        <div className="pb-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque pelo nome do vídeo..."
            aria-label="Buscar vídeo"
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 "
          />
        </div>

        <div className="min-h-0 flex-1">
          {visibleVideos.length === 0 ? (
            <div className="py-4">
              <strong className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {search
                  ? "Nenhum vídeo encontrado"
                  : "Nenhum vídeo enviado ainda"}
              </strong>

              <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                {search
                  ? "Tente buscar por outro nome de arquivo."
                  : "Assim que o upload for concluído o vídeo aparecerá aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleVideos.map((video) => (
                <Link
                  key={video.id}
                  to={`/video/${video.id}`}
                  className="group block rounded-lg border border-transparent px-2 py-3 transition-colors  hover:bg-blue-50 dark:hover:bg-neutral-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <strong
                        title={video.filename}
                        className="min-w-0 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {video.filename}
                      </strong>

                      <StatusBadge status={video.status} />
                    </div>



                    <div className="mt-2 pt-2">
                      <div className="flex justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                          {video.ai_config.model_name}
                        </span>

                        <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
                          {video.transcription_ready
                            ? "Com transcrição"
                            : "Sem transcrição"}
                        </span>
                      </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span><b>Data:</b></span>

                        <span className="truncate">
                            {formatDate(video.created_at)}
                        </span>
                        </div>

                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Paginação da biblioteca"
            className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800"
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Página anterior"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                      ? "bg-blue-600 text-white dark:bg-blue-800 dark:hover:bg-blue-700"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <FaChevronRight aria-hidden="true" className="size-3" />
            </button>
          </nav>
        )}
      </section>
    );
  },
);
