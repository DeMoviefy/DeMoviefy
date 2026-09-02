// src/pages/Upload/components/DashboardSidebar.tsx

import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { VideoLibrary } from "src/pages/Upload/components/VideoLibrary"

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
        <div className="dashboard-sidebar-header">
          <h2>Biblioteca</h2>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Fechar sidebar"
          >
            ✕
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