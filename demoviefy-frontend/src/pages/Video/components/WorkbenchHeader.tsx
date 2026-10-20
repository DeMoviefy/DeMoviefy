// src/pages/Dashboard/components/WorkbenchHeader.tsx

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { StatusBadge } from "src/core/components/StatusBadge"
import { ProcessingProgress } from "src/core/components/ProcessingProgress"
import { formatVideoModelName } from "src/core/utils/videoHelpers"
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
        <div className="mt-1 flex min-w-0 items-center justify-between gap-4">
          <h2
            className="min-w-0 truncate text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
            title={video.filename}
          >
            {video.filename}
          </h2>
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <FaArrowLeft aria-hidden="true" className="size-3" />
            {t("returnToDashboard")}
          </Link>
        </div>
        <div className="mt-3">
          <StatusBadge status={video.status} />
        </div>
      </div>

      {video.status.startsWith("PROCESSANDO") && (
        <ProcessingProgress
          modelName={formatVideoModelName(video.ai_config.model_name)}
          progress={video.processing.processing_progress}
          stage={video.processing.processing_stage}
          etaSeconds={video.processing.processing_eta_seconds}
          message={video.processing.processing_message}
        />
      )}
    </>
  );
}
