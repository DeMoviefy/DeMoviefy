// src/pages/Dashboard/components/DashboardSidebar.tsx

import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { VideoLibrary } from "src/pages/Dashboard/components/VideoLibrary"

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {

  const videos = useProcessingStore((state) => state.videos);
  const loading = useProcessingStore((state) => state.loading);

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed left-0 top-20 z-40 h-[calc(100vh-5rem)] w-72 border-r border-slate-800 bg-slate-950 transition-transform ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <h2 className="font-semibold">
            Biblioteca
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-white"
            aria-label="Fechar biblioteca"
          >
            Fechar
          </button>
        </div>
        
        <VideoLibrary
          videos={videos}
          loading={loading}
          onNavigate={onClose}
        />
      </aside>
    </>
  )
}