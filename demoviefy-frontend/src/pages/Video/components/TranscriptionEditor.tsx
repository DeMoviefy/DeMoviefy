// src/pages/Video/components/TranscriptionEditor.tsx

import { useEffect, useState } from "react";
import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";

type TranscriptionSegment = VideoTranscriptionResponse["transcription"]["segments"][number];
type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];

interface TranscriptionEditorProps {
    transcriptionDraft: string;
    transcriptionMessage: string;
    segments: TranscriptionSegment[];
    hasChanges: boolean;
    isBusy: boolean;
    onDraftChange: (value: string) => void;
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
    onSegmentsChange: (segments: TranscriptionSegment[]) => void;
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

function formatSrtTime(seconds: number): string {
    const milliseconds = Math.max(0, Math.round(seconds * 1000));
    const hours = Math.floor(milliseconds / 3_600_000);
    const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
    const remainingSeconds = Math.floor((milliseconds % 60_000) / 1000);
    const remainder = milliseconds % 1000;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")},${String(remainder).padStart(3, "0")}`;
}

function formatSrt(segments: TranscriptionSegment[], fallbackText: string): string {
    if (segments.length === 0) {
        return fallbackText ? `1\n00:00:00,000 --> 00:00:00,000\n${fallbackText}` : "";
    }

    return segments.map((segment, index) =>
        `${String(index + 1).padStart(2, "0")}\n${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}\n${segment.text}`
    ).join("\n\n");
}

function parseSrtTime(value: string): number | null {
    const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
    if (!match) return null;
    const [, hours, minutes, seconds, milliseconds] = match;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds.padEnd(3, "0")) / 1000;
}

function parseSrt(value: string): TranscriptionSegment[] {
    return value.trim().split(/\n\s*\n/).flatMap((block, index) => {
        const lines = block.split("\n").map((line) => line.trimEnd());
        const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
        if (timeLineIndex < 0) return [];

        const [startValue, endValue] = lines[timeLineIndex].split("-->");
        const start = parseSrtTime(startValue);
        const end = parseSrtTime(endValue);
        const text = lines.slice(timeLineIndex + 1).join("\n").trim();
        if (start === null || end === null || end < start || !text) return [];

        return [{ id: index + 1, start, end, text }];
    });
}

export function TranscriptionEditor({
    transcriptionDraft,
    transcriptionMessage,
    segments,
    hasChanges,
    isBusy,
    onDraftChange,
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
    onSegmentsChange,
    isTranslating,
    onTranslate,
}: TranscriptionEditorProps) {
    const [translationLanguage, setTranslationLanguage] = useState("en");
    const [isGenerationOpen, setIsGenerationOpen] = useState(false);
    const [isTranslationOpen, setIsTranslationOpen] = useState(false);
    const [srtDraft, setSrtDraft] = useState(() => formatSrt(segments, transcriptionDraft));
    const sourceLanguage = variants.find((variant) => variant.id === selectedVariant)?.language ?? selectedLanguage;
    const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]));
    const isWorking = isBusy || isGenerating || isTranslating;

    useEffect(() => {
        if (!hasChanges) setSrtDraft(formatSrt(segments, transcriptionDraft));
    }, [hasChanges, segments, transcriptionDraft, selectedVariant]);

    const handleSrtChange = (value: string) => {
        setSrtDraft(value);
        onDraftChange(value);
        onSegmentsChange(parseSrt(value));
    };

    return (
        <section className="flex min-w-0 flex-col gap-6">
            <div>
                <h3 className="text-base font-semibold text-neutral-900">Editor de transcrição</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Gere, traduza ou edite a transcrição no formato SRT.
                </p>
            </div>

            <textarea
                className="min-h-30 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 read-only:cursor-default"
                value={srtDraft}
                onChange={(event) => handleSrtChange(event.target.value)}
                readOnly={isWorking}
                placeholder={transcriptionMessage || "01\n00:00:00,000 --> 00:00:04,000\nTexto da transcrição"}
                spellCheck={false}
                aria-label="Transcrição no formato SRT"
            />

            <div className="flex justify-end">
                <button
                    type="button"
                    className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                    onClick={() => void onSave()}
                    disabled={isWorking || !hasChanges}
                >
                    Salvar transcrição
                </button>
            </div>

            <section className="border-t border-neutral-100 pt-5">
                <div className="text-left">
                    <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-neutral-900">
                            Gerar nova transcrição
                        </h4>
                        <button
                            type="button"
                            onClick={() => setIsGenerationOpen((open) => !open)}
                            aria-expanded={isGenerationOpen}
                            aria-controls="transcription-generation"
                            aria-label={isGenerationOpen ? "Recolher geração de transcrição" : "Expandir geração de transcrição"}
                            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isGenerationOpen ? "rotate-180" : ""}`}
                        >
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
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
                        Escolha o modelo e o idioma usados pela IA.
                    </p>
                </div>

                {isGenerationOpen && (
                    <div id="transcription-generation" className="mt-4 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="text-xs font-medium text-neutral-500">
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
                        </div>
                        <button
                            type="button"
                            className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onGenerate}
                            disabled={isWorking}
                        >
                            {isGenerating ? "Gerando transcrição..." : "Gerar transcrição por IA"}
                        </button>
                        {isGenerating && (
                            <p className="mt-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700" role="status" aria-live="polite">
                                O Whisper está gerando a transcrição. Isso pode levar alguns minutos.
                            </p>
                        )}
                    </div>
                )}
            </section>

            <section className="border-t border-neutral-100 pt-5">
                <div className="text-left">
                    <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-neutral-900">Traduzir transcrição</h4>
                        <button
                            type="button"
                            onClick={() => setIsTranslationOpen((open) => !open)}
                            aria-expanded={isTranslationOpen}
                            aria-controls="transcription-translation"
                            aria-label={isTranslationOpen ? "Recolher tradução" : "Expandir tradução"}
                            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isTranslationOpen ? "rotate-180" : ""}`}
                        >
                            <svg viewBox="0 0 20 20" fill="none" className="size-4">
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
                        Crie uma versão traduzida a partir da versão da transcrição selecionada.
                    </p>
                </div>

                {isTranslationOpen && (
                    <div id="transcription-translation" className="mt-4 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm">
                        <label className="block max-w-sm text-xs font-medium text-neutral-500">
                            Idioma da tradução
                            <select
                                value={translationLanguage}
                                onChange={(event) => setTranslationLanguage(event.target.value)}
                                className={SELECT_CLASS}
                                disabled={isWorking}
                            >
                                {["pt", "en", "es"].map((language) => (
                                    <option key={language} value={language}>{language.toUpperCase()}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => onTranslate(translationLanguage)}
                            disabled={isWorking || !sourceLanguage || sourceLanguage === translationLanguage}
                            title={sourceLanguage === translationLanguage ? "A transcrição já está nesse idioma." : "Traduzir somente ao clicar"}
                        >
                            {isTranslating ? "Traduzindo..." : "Traduzir"}
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
}
