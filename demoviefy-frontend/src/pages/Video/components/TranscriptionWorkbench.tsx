import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { GenerateTranscription } from "src/pages/Video/components/GenerateTranscription";
import { TranscriptionTextEditor } from "src/pages/Video/components/TranscriptionTextEditor";
import { TranslateTranscription } from "src/pages/Video/components/TranslateTranscription";
import { useTranscriptionStore } from "src/pages/Video/stores/useTranscriptionStore";

type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];

type TranscriptionWorkbenchProps = {
    isBusy: boolean;
};

export function TranscriptionWorkbench({ isBusy }: TranscriptionWorkbenchProps) {
    const {
        transcription,
        transcriptionDraft,
        transcriptionMessage,
        transcriptionSegments: segments,
        selectedLanguage,
        selectedModel,
        selectedVariant,
        isGenerating,
        isTranslating,
        setTranscriptionDraft,
        setTranscriptionSegments,
        setLanguage,
        setModel,
        onSaveTranscription,
        onGenerateTranscription,
        translateTranscription,
    } = useTranscriptionStore();
    const variants: TranscriptionVariant[] = transcription?.variants ?? [
        { id: "default", label: "Transcrição principal", language: null },
    ];
    const availableLanguages = transcription?.available_languages ?? [];
    const originalSegments = transcription?.transcription.segments ?? [];
    const transcriptionContent = transcription?.transcription.content ?? "";
    const hasTranscription = Boolean(transcription?.available);
    const hasChanges = transcriptionDraft !== transcriptionContent
        || JSON.stringify(segments) !== JSON.stringify(originalSegments);
    const sourceLanguage = variants.find((variant) => variant.id === selectedVariant)?.language ?? selectedLanguage;
    const isWorking = isBusy || isGenerating || isTranslating;

    return (
        <section className="flex min-w-0 flex-col gap-6">
            <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Editor de transcrição</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
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
                onDraftChange={setTranscriptionDraft}
                onSegmentsChange={setTranscriptionSegments}
                onSave={onSaveTranscription}
            />

            <section>
                <div className="py-5 text-left">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        Gerar ou traduzir transcrição
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                        Gere uma nova versão ou traduza a transcrição selecionada.
                    </p>
                </div>

                <div className="mt-2 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <GenerateTranscription
                        selectedModel={selectedModel}
                        selectedLanguage={selectedLanguage}
                        availableLanguages={availableLanguages}
                        isBusy={isWorking}
                        isGenerating={isGenerating}
                        onModelChange={setModel}
                        onLanguageChange={setLanguage}
                        onGenerate={onGenerateTranscription}
                    />

                    <TranslateTranscription
                        sourceLanguage={sourceLanguage}
                        hasTranscription={hasTranscription}
                        variants={variants}
                        selectedVariant={selectedVariant}
                        isBusy={isWorking}
                        isTranslating={isTranslating}
                        onTranslate={(sourceVariant, language) => void translateTranscription(language, sourceVariant)}
                    />
                </div>
            </section>
        </section>
    );
}
