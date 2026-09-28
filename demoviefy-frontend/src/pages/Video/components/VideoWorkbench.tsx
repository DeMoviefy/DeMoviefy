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
import { TranscriptionVersion } from "src/pages/Video/components/TranscriptionVersion";
import { TranscriptionWorkbench } from "src/pages/Video/components/TranscriptionWorkbench";
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
    const currentVideo = processingVideo ?? video;

    useVideoWorkbenchSync(currentVideo);

    const {
        analysis, analysisState, analysisMessage, selectedAnalysisVariantId,
        setSelectedAnalysisVariantId, onDeleteAnalysis,
    } = useAnalysisStore();
    const {
        transcription, transcriptionDraft, transcriptionMessage, setTranscriptionDraft,
        onSaveTranscription, onDeleteTranscription, onGenerateTranscription,
        selectedLanguage, setLanguage, selectedModel, setModel, isGenerating,
        selectedVariant, setSelectedVariant, transcriptionSegments, setTranscriptionSegments,
        isTranslating, translateTranscription,
    } = useTranscriptionStore();

    const summary = analysis?.analysis ?? null;
    const analysisVariants = analysis?.available_variants ?? [];
    const availableLanguages = transcription?.available_languages ?? [];
    const hasTranscription = Boolean(transcription?.available);
    const transcriptionVariants = transcription?.variants ?? [
        { id: "default", label: "Transcrição principal", language: null },
    ];
    const originalSegments = transcription?.transcription.segments ?? [];
    const transcriptionContent = transcription?.transcription.content ?? "";
    const hasTranscriptionChanges = transcriptionDraft !== transcriptionContent
        || JSON.stringify(transcriptionSegments) !== JSON.stringify(originalSegments);
    const hasSelectedAnalysis = analysis !== null;
    const isProcessing = currentVideo?.status.startsWith("PROCESSANDO") ?? false;

    const { annotatedVideoSrc } = useVideoPlayer(currentVideo, selectedAnalysisVariantId);

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
                        <h3 className="mb-6 text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Detalhes da análise
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                            <div className="px-3 py-5">
                                <AnalysisMetrics summary={summary} modelName={currentVideo.ai_config.model_name} />
                            </div>
                            <div className="px-3 py-5">
                                <AnalysisVersion
                                    message={analysisMessage}
                                    variants={analysisVariants}
                                    selectedVariantId={selectedAnalysisVariantId}
                                    onDelete={() => onDeleteAnalysis(currentVideo)}
                                    onVariantChange={(id) => {
                                        setSelectedAnalysisVariantId(id, currentVideo);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                />
                                <TranscriptionVersion
                                    variants={transcriptionVariants}
                                    selectedVariant={selectedVariant}
                                    onVariantChange={setSelectedVariant}
                                    hasTranscription={hasTranscription}
                                    onDelete={onDeleteTranscription}
                                    disabled={isBusy || isProcessing || isGenerating || isTranslating}
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
                    <AnalysisResults state={analysisState} summary={summary} />
                    <TranscriptionWorkbench
                        transcriptionDraft={transcriptionDraft}
                        transcriptionMessage={transcriptionMessage}
                        segments={transcriptionSegments}
                        hasTranscription={hasTranscription}
                        hasChanges={hasTranscriptionChanges}
                        isBusy={isBusy}
                        onDraftChange={setTranscriptionDraft}
                        onSave={onSaveTranscription}
                        onGenerate={onGenerateTranscription}
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={setLanguage}
                        availableLanguages={availableLanguages}
                        selectedModel={selectedModel}
                        onModelChange={setModel}
                        isGenerating={isGenerating}
                        variants={transcriptionVariants}
                        selectedVariant={selectedVariant}
                        onSegmentsChange={setTranscriptionSegments}
                        isTranslating={isTranslating}
                        onTranslate={(language) => void translateTranscription(language)}
                    />
                </div>
            </div>
        </section>
    );
});
