import { FaBars } from "react-icons/fa";
import { useProcessingStore } from "src/core/stores/useProcessingStore";

import { DashboardVideoLibrary } from "src/pages/Dashboard/components/DashboardVideoLibrary";

type DashboardSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const videos = useProcessingStore((state) => state.videos);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-visible transition-[width] duration-200 ease-in-out ${isOpen ? "w-72" : "w-12"}`}
    >
      <div id="dashboard-video-library" className="flex min-h-0 flex-1 flex-col">
        <div className={`flex min-h-9 items-center pb-2 ${isOpen ? "justify-between pr-8" : "justify-start"}`}>
          {isOpen && (
            <h2 className="truncate text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Biblioteca de vídeos
            </h2>
          )}
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="dashboard-video-library-content"
            aria-label={isOpen ? "Recolher biblioteca de vídeos" : "Expandir biblioteca de vídeos"}
            title={isOpen ? "Recolher biblioteca" : "Expandir biblioteca"}
            onClick={onToggle}
            className={`inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${isOpen ? "" : "-ml-2"}`}
          >
            <FaBars aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div id="dashboard-video-library-content" hidden={!isOpen} className="min-h-0 flex-1 overflow-hidden">
          <DashboardVideoLibrary videos={videos} />
        </div>
      </div>
    </aside>
  );
}
