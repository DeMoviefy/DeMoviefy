import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { GenerateTranscription } from "src/pages/Video/components/GenerateTranscription";
import { TranscriptionTextEditor } from "src/pages/Video/components/TranscriptionTextEditor";
import { TranslateTranscription } from "src/pages/Video/components/TranslateTranscription";

type TranscriptionSegment = VideoTranscriptionResponse["transcription"]["segments"][number];
type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];

type TranscriptionWorkbenchProps = {
    transcriptionDraft: string;
    transcriptionMessage: string;
    segments: TranscriptionSegment[];
    hasTranscription: boolean;
    hasChanges: boolean;
    isBusy: boolean;
    onDraftChange: (value: string) => void;
    onSegmentsChange: (segments: TranscriptionSegment[]) => void;
    onSave: () => void | Promise<void>;
    onGenerate: () => void;
    selectedLanguage: string;
    onLanguageChange: (language: string) => void;
    availableLanguages: string[];
    selectedModel: string;
    onModelChange: (model: string) => void;
    isGenerating: boolean;
    variants: TranscriptionVariant[];
    selectedVariant: string;
    isTranslating: boolean;
    onTranslate: (targetLanguage: string) => void;
};

export function TranscriptionWorkbench({
    transcriptionDraft,
    transcriptionMessage,
    segments,
    hasTranscription,
    hasChanges,
    isBusy,
    onDraftChange,
    onSegmentsChange,
    onSave,
    onGenerate,
    selectedLanguage,
    onLanguageChange,
    availableLanguages,
    selectedModel,
    onModelChange,
    isGenerating,
    variants,
    selectedVariant,
    isTranslating,
    onTranslate,
}: TranscriptionWorkbenchProps) {
    const sourceLanguage = variants.find((variant) => variant.id === selectedVariant)?.language ?? selectedLanguage;
    const isWorking = isBusy || isGenerating || isTranslating;

    return (
        <section className="flex min-w-0 flex-col gap-6">
            <div>
                <h3 className="text-base font-semibold text-neutral-900">Editor de transcrição</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Edite a transcrição no formato SRT ou gere e traduza versões.
                </p>
            </div>

            <TranscriptionTextEditor
                draft={transcriptionDraft}
                message={transcriptionMessage}
                segments={segments}
                hasChanges={hasChanges}
                isBusy={isWorking}
                selectedVariant={selectedVariant}
                onDraftChange={onDraftChange}
                onSegmentsChange={onSegmentsChange}
                onSave={onSave}
            />

            <GenerateTranscription
                selectedModel={selectedModel}
                selectedLanguage={selectedLanguage}
                availableLanguages={availableLanguages}
                isBusy={isWorking}
                isGenerating={isGenerating}
                onModelChange={onModelChange}
                onLanguageChange={onLanguageChange}
                onGenerate={onGenerate}
            />

            <TranslateTranscription
                sourceLanguage={sourceLanguage}
                hasTranscription={hasTranscription}
                isBusy={isWorking}
                isTranslating={isTranslating}
                onTranslate={onTranslate}
            />
        </section>
    );
}
