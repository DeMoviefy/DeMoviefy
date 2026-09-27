// src/pages/Video/components/VideoWorkbench.tsx

import { memo } from "react";

import { useVideoPlayer } from "src/pages/Video/hooks/useVideoPlayer";
import { useAnalysisStore } from "src/pages/Video/stores/useAnalysisStore";
import { useTranscriptionStore } from "src/pages/Video/stores/useTranscriptionStore";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useVideoWorkbenchSync } from "src/pages/Video/hooks/useVideoWorkbenchSync";

import { WorkbenchHeader } from "src/pages/Video/components/WorkbenchHeader";
import { VideoConfigPanel } from "src/pages/Video/components/VideoConfigPanel";
import { AnalysisVersion } from "src/pages/Video/components/AnalysisVersion";
import { AnalysisResults } from "src/pages/Video/components/AnalysisResults";
import { AnalysisMetrics } from "src/pages/Video/components/AnalysisMetrics";
import { TranscriptionEditor } from "src/pages/Video/components/TranscriptionEditor";
import { VideoPreviewPanel } from "src/pages/Video/components/VideoPreviewPanel";
import { WorkbenchEmptyState } from "src/pages/Video/components/WorkbenchEmptyState";

import type { AiConfigPayload, VideoRecord } from "src/core/types/videoTypes";

type VideoWorkbenchProps = {
    video: VideoRecord | null;
    config: AiConfigPayload;
    isBusy: boolean;
    onConfigChange: (config: AiConfigPayload) => void;
    onReprocess: () => void;
};

export const VideoWorkbench = memo(function VideoWorkbench({
    video,
    config,
    isBusy,
    onConfigChange,
    onReprocess,
}: VideoWorkbenchProps) {

    const processingVideo = useProcessingStore((state) =>
        state.videos.find((item) => item.id === video?.id)
    );

    const currentVideo = processingVideo ?? video; // Essa linha faz com que o poller seja atualizado.

    useVideoWorkbenchSync(currentVideo);

    const {
        analysis, analysisState, analysisMessage, selectedAnalysisVariantId,
        setSelectedAnalysisVariantId,
        onDeleteAnalysis,
    } = useAnalysisStore();

    const {
        transcription, transcriptionDraft, transcriptionMessage,
        setTranscriptionDraft,
        onSaveTranscription, onDeleteTranscription, onGenerateTranscription,
    } = useTranscriptionStore();

    const summary = analysis?.analysis ?? null;
    const analysisVariants = analysis?.available_variants ?? [];
    const transcriptionSegments = transcription?.transcription.segments ?? [];
    const transcriptionContent = transcription?.transcription.content ?? "";
    const hasTranscriptionChanges = transcriptionDraft !== transcriptionContent;
    const hasSelectedAnalysis = analysis !== null;
    const isProcessing = currentVideo.status.startsWith("PROCESSANDO");

    const { annotatedVideoSrc, seekTo } = useVideoPlayer(
        currentVideo,
        selectedAnalysisVariantId
    );

    if (!currentVideo) return <WorkbenchEmptyState />;

    return (
        <section className="flex w-full flex-col gap-6 py-4">
            <WorkbenchHeader video={currentVideo} />

            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="min-w-0">
                    <VideoPreviewPanel
                        video={currentVideo}
                        analysisState={analysisState}
                        hasSelectedAnalysis={hasSelectedAnalysis}
                        annotatedVideoSrc={annotatedVideoSrc}
                    />

                    <div className="mt-6 min-w-0">
                        <h3 className="mb-6 text-base font-semibold tracking-tight text-neutral-900">
                            Detalhes da análise
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                            <div className="px-3 py-5">
                                <AnalysisMetrics
                                    summary={summary}
                                    modelName={currentVideo.ai_config.model_name}
                                />
                            </div>

                            <div className="px-3 py-5">
                                <AnalysisVersion
                                    message={analysisMessage}
                                    variants={analysisVariants}
                                    selectedVariantId={selectedAnalysisVariantId}
                                    onDelete={() => onDeleteAnalysis(currentVideo)}
                                    onVariantChange={(id) => {
                                        setSelectedAnalysisVariantId(id, currentVideo);

                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <VideoConfigPanel
                                video={currentVideo}
                                config={config}
                                onConfigChange={onConfigChange}
                                isBusy={isBusy || isProcessing}
                                onReprocess={onReprocess}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <AnalysisResults
                        state={analysisState}
                        summary={summary}
                    />
                    <TranscriptionEditor
                        transcriptionDraft={transcriptionDraft}
                        transcriptionMessage={transcriptionMessage}
                        segments={transcriptionSegments}
                        hasTranscription={currentVideo.transcription_ready}
                        hasChanges={hasTranscriptionChanges}
                        isBusy={isBusy}
                        onDraftChange={setTranscriptionDraft}
                        onSave={() => onSaveTranscription()}
                        onDelete={() => onDeleteTranscription()}
                        onGenerate={() => onGenerateTranscription()}
                        onSeek={seekTo}
                    />
                </div>
            </div>
        </section>
    );
});
