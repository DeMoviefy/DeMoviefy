// src/pages/Dashboard/components/WorkbenchHeader.tsx

import { useTranslation } from "react-i18next";
import { StatusBadge } from "src/core/components/StatusBadge"
import { ProcessingProgress } from "src/core/components/ProcessingProgress"
import type { VideoRecord } from "src/core/types/videoTypes"

type WorkbenchHeaderProps = {
  video: VideoRecord
}

export function WorkbenchHeader({ video }: WorkbenchHeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="min-w-0">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {t("analysisVideo")}
        </span>
  
        <h2
          className="mt-1 truncate text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
          title={video.filename}
        >
          {video.filename}
        </h2>
  
        <div className="mt-3">
          <StatusBadge status={video.status} />
        </div>
      </div>
  
      {video.status.startsWith("PROCESSANDO") && (
        <ProcessingProgress
          modelName={video.ai_config.model_name}
          progress={video.processing.processing_progress}
          stage={video.processing.processing_stage}
          etaSeconds={video.processing.processing_eta_seconds}
          message={video.processing.processing_message}
        />
      )}
    </>
  );
}
