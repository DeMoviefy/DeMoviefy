// src/pages/Dashboard/components/VideoConfigPanel.tsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCatalogStore } from "src/core/stores/useAICatalogStore"

import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { VideoAnalysisConfig } from "src/core/components/VideoAnalysisConfig"

import { useAnalysisStore } from "src/pages/Video/stores/useAnalysisStore"
import type { AiConfigPayload, VideoRecord } from "src/core/types/videoTypes"


interface VideoConfigPanelProps {
    video: VideoRecord
    config: AiConfigPayload
    onConfigChange: (config: AiConfigPayload) => void
    isBusy: boolean
    onSaveConfig: () => void
    onReprocess: () => void
}

export function VideoConfigPanel({
    video,
    config,
    onConfigChange,
    isBusy,
    onSaveConfig,
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
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="group flex w-full items-center justify-between py-2 text-left"
            >
                <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                        Reprocessar vídeo
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                        Ajuste a configuração e execute uma nova análise.
                    </p>
                </div>

                <span
                    className={`text-sm text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                >
                    ↓
                </span>
            </button>

            {isOpen && (
                <div className="mt-6">
                    <VideoAnalysisConfig
                        taskType={config.task_type}
                        modelPath={config.model_path}
                        frameStride={config.frame_stride}
                        confidenceThreshold={config.confidence_threshold}
                        maxFrames={config.max_frames}
                        clipStart={config.clip_start_sec}
                        clipEnd={config.clip_end_sec}
                        tasks={tasks}
                        models={models}
                        onTaskChange={(value) => update("task_type", value)}
                        onModelChange={(value) => update("model_path", value)}
                        onFrameStrideChange={(value) => update("frame_stride", value)}
                        onConfidenceChange={(value) =>
                            update("confidence_threshold", value)
                        }
                        onMaxFramesChange={(value) => update("max_frames", value)}
                        onClipStartChange={(value) => update("clip_start_sec", value)}
                        onClipEndChange={(value) => update("clip_end_sec", value || null)}
                    />

                    <div className="mt-8 flex flex-wrap items-center justify-end gap-3">

                        <ConfirmationDialog
                            title="Excluir vídeo"
                            message="Tem certeza de que deseja excluir o vídeo? Esta ação é irreversível."
                            onConfirm={handleDeleteVideo}
                        >
                            {(open) => (
                                <button
                                    type="button"
                                    className="text-sm font-medium text-neutral-500 transition-colors hover:text-red-600"
                                    onClick={open}
                                >
                                    Excluir vídeo
                                </button>
                            )}
                        </ConfirmationDialog>

                        <button
                            type="button"
                            className="border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onSaveConfig}
                            disabled={isBusy}
                        >
                            Salvar configuração
                        </button>

                        <button
                            type="button"
                            className="bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        </section>

    )
}

