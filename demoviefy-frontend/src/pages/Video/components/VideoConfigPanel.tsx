// src/pages/Dashboard/components/VideoConfigPanel.tsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCatalogStore } from "src/core/stores/useAICatalogStore"
import { FaTrashAlt } from "react-icons/fa"
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { VideoAnalysisConfig } from "src/core/components/VideoAnalysisConfig"

import { useAnalysisStore } from "src/pages/Video/stores/useAnalysisStore"
import type { AiConfigPayload, VideoRecord } from "src/core/types/videoTypes"


interface VideoConfigPanelProps {
    video: VideoRecord
    config: AiConfigPayload
    onConfigChange: (config: AiConfigPayload) => void
    isBusy: boolean
    onReprocess: () => void
}

export function VideoConfigPanel({
    video,
    config,
    onConfigChange,
    isBusy,
    onReprocess,
}: VideoConfigPanelProps) {


    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate();
    const { tasks, models } = useCatalogStore()
    const onDeleteVideo = useAnalysisStore((state) => state.onDeleteVideo)

    const handleDeleteVideo = async () => {
        const deleted = await onDeleteVideo(video);

        if (deleted) {
            navigate("/dashboard");
        }
    }

    const update = (field: keyof AiConfigPayload, value: string | null) =>
        onConfigChange({ ...config, [field]: value })


    return (
        <section>
            <div className="py-5 text-left">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-neutral-900">
                            Reprocessar vídeo
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsOpen((open) => !open)}
                            aria-expanded={isOpen}
                            aria-controls="video-reprocess-config"
                            aria-label={isOpen ? "Recolher configurações" : "Expandir configurações"}
                            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isOpen ? "rotate-180" : ""}`}
                        >
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                className="size-4"
                            >
                                <path
                                    d="m5 7.5 5 5 5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                        Execute uma nova análise do vídeo.
                    </p>
                </div>
            </div>

            {isOpen && (
                <div id="video-reprocess-config" className="mt-2 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm">
                    <VideoAnalysisConfig
                        showSectionCards={false}
                        taskType={config.task_type}
                        modelPath={config.model_path}
                        clipStart={config.clip_start_sec}
                        clipEnd={config.clip_end_sec}
                        tasks={tasks}
                        models={models}
                        onTaskChange={(value) => update("task_type", value)}
                        onModelChange={(value) => update("model_path", value)}
                        onClipStartChange={(value) => update("clip_start_sec", value)}
                        onClipEndChange={(value) => update("clip_end_sec", value || null)}
                    />

                    <div className="mt-8 flex flex-wrap items-center justify-end gap-3">


                        <button
                            type="button"
                            className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onReprocess}
                            disabled={isBusy}
                        >
                            {isBusy
                                ? `Processando... ${video.processing.processing_progress}%`
                                : "Reprocessar vídeo"}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-start border-t border-neutral-100 py-4">
                <ConfirmationDialog
                    title="Excluir vídeo"
                    message="Tem certeza de que deseja excluir o vídeo? Esta ação é irreversível."
                    onConfirm={handleDeleteVideo}
                >
                    {(open) => (
                        <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            onClick={open}
                        >
                            <FaTrashAlt aria-hidden="true" className="size-3" />
                            Excluir vídeo
                        </button>
                    )}
                </ConfirmationDialog>
            </div>
        </section>

    )
}
