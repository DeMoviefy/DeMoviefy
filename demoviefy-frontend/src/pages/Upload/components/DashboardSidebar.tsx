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
      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
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