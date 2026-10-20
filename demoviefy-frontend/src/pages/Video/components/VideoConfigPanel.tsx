// src/pages/Dashboard/components/VideoConfigPanel.tsx

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useCatalogStore } from "src/core/stores/useAICatalogStore"
import { FaTrashAlt } from "react-icons/fa"
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { VideoAnalysisConfig } from "src/core/components/VideoAnalysisConfig"

import { useAnalysisStore } from "src/pages/Video/stores/useAnalysisStore"
import type { AiConfigPayload, VideoRecord } from "src/core/types/videoTypes"


interface VideoConfigPanelProps {
    config: AiConfigPayload
    videoSource: string
    durationSeconds: number | null
    onConfigChange: (config: AiConfigPayload) => void
    isBusy: boolean
    onReprocess: () => void
}

export function VideoConfigPanel({
    config,
    videoSource,
    durationSeconds,
    onConfigChange,
    isBusy,
    onReprocess,
}: VideoConfigPanelProps) {
    const { t } = useTranslation();

    const { tasks, models } = useCatalogStore()

    const update = (field: keyof AiConfigPayload, value: string | null) =>
        onConfigChange({ ...config, [field]: value })


    return (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 pt-5 dark:border-neutral-700 dark:bg-neutral-800/70 sm:p-5">
            <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("reprocessVideo")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {t("reprocessDescription")}
                </p>
            </div>

            <div className="mt-5 space-y-5">
                <VideoAnalysisConfig
                    configCard
                    footer={(
                        <button
                            type="button"
                            className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
                            onClick={onReprocess}
                            disabled={isBusy}
                        >
                            {isBusy
                                ? t("processingNow")
                                : t("reprocessVideo")}
                        </button>
                    )}
                    taskType={config.task_type}
                    modelPath={config.model_path}
                    clipStart={config.clip_start_sec}
                    clipEnd={config.clip_end_sec}
                    videoSource={videoSource}
                    knownDurationSeconds={durationSeconds}
                    frameStride={config.frame_stride}
                    tasks={tasks}
                    models={models}
                    onTaskChange={(value) => update("task_type", value)}
                    onModelChange={(value) => update("model_path", value)}
                    onClipStartChange={(value) => update("clip_start_sec", value)}
                    onClipEndChange={(value) => update("clip_end_sec", value || null)}
                    onFrameStrideChange={(value) => update("frame_stride", value)}
                />
            </div>
        </section>

    )
}

export function DeleteVideoButton({ video }: { video: VideoRecord }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const onDeleteVideo = useAnalysisStore((state) => state.onDeleteVideo)

    const handleDeleteVideo = async () => {
        const deleted = await onDeleteVideo(video);

        if (deleted) {
            navigate("/dashboard");
        }
    }

    return (
        <div className="flex justify-start border-t border-neutral-100 py-4 dark:border-neutral-800">
            <ConfirmationDialog
                title={t("deleteVideo")}
                message={t("deleteVideoConfirm")}
                onConfirm={handleDeleteVideo}
            >
                {(open) => (
                    <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-900"
                        onClick={open}
                    >
                        <FaTrashAlt aria-hidden="true" className="size-3" />
                        {t("deleteVideo")}
                    </button>
                )}
            </ConfirmationDialog>
        </div>
    )
}
