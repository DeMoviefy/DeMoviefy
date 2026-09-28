// src/pages/Video/components/TranscriptionEditor.tsx

import { useState } from "react";
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog";
import { formatTimecode } from "src/core/utils/videoHelpers";
import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";

type TranscriptionSegment = VideoTranscriptionResponse["transcription"]["segments"][number];
type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];

interface TranscriptionEditorProps {
    transcriptionDraft: string;
    transcriptionMessage: string;
    segments: TranscriptionSegment[];
    hasTranscription: boolean;
    hasChanges: boolean;
    isBusy: boolean;
    onDraftChange: (value: string) => void;
    onSave: () => void | Promise<void>;
    onDelete: () => void;
    onGenerate: () => void;
    onSeek: (seconds: number) => void;
    selectedLanguage: string;
    onLanguageChange: (language: string) => void;
    availableLanguages: string[];
    selectedModel: string;
    onModelChange: (model: string) => void;
    isGenerating: boolean;
    variants: TranscriptionVariant[];
    selectedVariant: string;
    onVariantChange: (variant: string) => void;
    onSegmentChange: (id: number, field: "start" | "end" | "text", value: string) => void;
    isTranslating: boolean;
    onTranslate: (targetLanguage: string) => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
    auto: "Detectar automaticamente",
    pt: "Português",
    en: "English",
    es: "Español",
};

const MODEL_OPTIONS = [
    { value: "tiny", label: "Rápida (tiny)" },
    { value: "base", label: "Equilibrada (base)" },
    { value: "small", label: "Mais precisa (small)" },
    { value: "medium", label: "Alta precisão (medium)" },
    { value: "large", label: "Máxima precisão (large)" },
];

const SELECT_CLASS = "mt-1.5 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";

export function TranscriptionEditor({
    transcriptionDraft,
    transcriptionMessage,
    segments,
    hasTranscription,
    hasChanges,
    isBusy,
    onDraftChange,
    onSave,
    onDelete,
    onGenerate,
    onSeek,
    selectedLanguage,
    onLanguageChange,
    availableLanguages,
    selectedModel,
    onModelChange,
    isGenerating,
    variants,
    selectedVariant,
    onVariantChange,
    onSegmentChange,
    isTranslating,
    onTranslate,
}: TranscriptionEditorProps) {
    const [translationLanguage, setTranslationLanguage] = useState("en");
    const [isEditing, setIsEditing] = useState(false);
    const sourceLanguage = variants.find((variant) => variant.id === selectedVariant)?.language ?? selectedLanguage;
    const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]));
    const isWorking = isBusy || isGenerating || isTranslating;

    return (
        <section className="flex min-w-0 flex-col gap-6">
            <div>
                <h3 className="text-base font-semibold text-neutral-900">Editor de transcrição</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Gere, traduza ou edite o texto e seus segmentos.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-neutral-500">
                    Versão
                    <select
                        value={selectedVariant}
                        onChange={(event) => onVariantChange(event.target.value)}
                        className={SELECT_CLASS}
                        disabled={isWorking}
                    >
                        {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>{variant.label}</option>
                        ))}
                    </select>
                </label>

                <label className="text-xs font-medium text-neutral-500">
                    Idioma da transcrição
                    <select
                        value={selectedLanguage || "auto"}
                        onChange={(event) => onLanguageChange(event.target.value)}
                        className={SELECT_CLASS}
                        disabled={isWorking}
                    >
                        {languageOptions.map((language) => (
                            <option key={language} value={language}>
                                {LANGUAGE_LABELS[language] ?? language.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-xs font-medium text-neutral-500 sm:col-span-2">
                    Modelo de transcrição
                    <select
                        value={selectedModel}
                        onChange={(event) => onModelChange(event.target.value)}
                        className={SELECT_CLASS}
                        disabled={isWorking}
                    >
                        {MODEL_OPTIONS.map((model) => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={onGenerate}
                    disabled={isWorking}
                >
                    {isGenerating ? "Gerando transcrição..." : "Gerar transcrição por IA"}
                </button>

                <label className="sr-only" htmlFor="transcription-translation-language">
                    Idioma da tradução
                </label>
                <select
                    id="transcription-translation-language"
                    value={translationLanguage}
                    onChange={(event) => setTranslationLanguage(event.target.value)}
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isWorking}
                >
                    {["pt", "en", "es"].map((language) => (
                        <option key={language} value={language}>{language.toUpperCase()}</option>
                    ))}
                </select>
                <button
                    type="button"
                    className="cursor-pointer rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onTranslate(translationLanguage)}
                    disabled={isWorking || !sourceLanguage || sourceLanguage === translationLanguage}
                    title={sourceLanguage === translationLanguage ? "A transcrição já está nesse idioma." : "Traduzir somente ao clicar"}
                >
                    {isTranslating ? "Traduzindo..." : "Traduzir"}
                </button>

                {!isEditing && (
                    <button
                        type="button"
                        className="cursor-pointer rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setIsEditing(true)}
                        disabled={isWorking}
                    >
                        Editar transcrição
                    </button>
                )}
            </div>

            {isGenerating && (
                <p className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700" role="status" aria-live="polite">
                    O Whisper está gerando a transcrição. Isso pode levar alguns minutos.
                </p>
            )}

            <textarea
                className="min-h-30 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 read-only:cursor-default"
                value={transcriptionDraft}
                onChange={(event) => onDraftChange(event.target.value)}
                readOnly={!isEditing || isWorking}
                placeholder={transcriptionMessage || "A transcrição aparecerá aqui."}
            />

            {transcriptionMessage && (
                <p className="-mt-4 text-xs leading-5 text-neutral-500" aria-live="polite">
                    {transcriptionMessage}
                </p>
            )}

            {segments.length > 0 && (
                <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {segments.map((segment) => (
                        <div
                            key={`${segment.id}-${segment.start}`}
                            className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center"
                        >
                            <button
                                type="button"
                                className="shrink-0 cursor-pointer text-left text-xs font-medium text-neutral-500 transition-colors hover:text-blue-700"
                                onClick={() => onSeek(segment.start)}
                                title="Ir para este momento do vídeo"
                            >
                                {formatTimecode(segment.start)} - {formatTimecode(segment.end)}
                            </button>
                            {isEditing ? (
                                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[6rem_6rem_minmax(0,1fr)]">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={segment.start}
                                        onChange={(event) => onSegmentChange(segment.id, "start", event.target.value)}
                                        aria-label="Início do segmento"
                                        className="min-w-0 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={segment.end}
                                        onChange={(event) => onSegmentChange(segment.id, "end", event.target.value)}
                                        aria-label="Fim do segmento"
                                        className="min-w-0 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <input
                                        type="text"
                                        value={segment.text}
                                        onChange={(event) => onSegmentChange(segment.id, "text", event.target.value)}
                                        aria-label="Texto do segmento"
                                        className="min-w-0 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm leading-6 text-neutral-700">{segment.text}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
                <ConfirmationDialog
                    title="Excluir transcrição"
                    message="Tem certeza que deseja excluir esta transcrição? Essa ação não pode ser desfeita."
                    onConfirm={onDelete}
                >
                    {(open) => (
                        <button
                            type="button"
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={open}
                            disabled={isWorking || !hasTranscription}
                        >
                            Excluir transcrição
                        </button>
                    )}
                </ConfirmationDialog>

                {isEditing && (
                    <button
                        type="button"
                        className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                        onClick={() => {
                            void onSave();
                            setIsEditing(false);
                        }}
                        disabled={isWorking || !hasChanges}
                    >
                        Salvar transcrição
                    </button>
                )}
            </div>
        </section>
    );
}
