// src/pages/Upload/components/DashboardProgressBar.tsx

import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useUploadStore } from "src/core/stores/useUploadStore";

export function DashboardProgressBar() {
  const uploading = useUploadStore((state) => state.uploading);
  const loadingVideos = useProcessingStore((state) => state.loading);

  const processState = uploading
    ? { text: "Upload em andamento", progress: null }
    : loadingVideos
    ? { text: "Atualizando biblioteca", progress: null }
    : null;

  if (!processState || processState.progress === null) return null;

  const value = processState.progress ?? 0;

  return (
    <section className="surface site-progress-panel">
      <div className="site-progress-title">
        <strong>{processState.text}</strong>
        <span>{value ? `${value}%` : "..."}</span>
      </div>
      <div className="site-progress-bar" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </section>
  );
}