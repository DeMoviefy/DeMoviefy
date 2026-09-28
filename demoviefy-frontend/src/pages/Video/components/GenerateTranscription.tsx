import { useState } from "react";

type GenerateTranscriptionProps = {
    selectedModel: string;
    selectedLanguage: string;
    availableLanguages: string[];
    isBusy: boolean;
    isGenerating: boolean;
    onModelChange: (model: string) => void;
    onLanguageChange: (language: string) => void;
    onGenerate: () => void;
};

const MODEL_OPTIONS = [
    { value: "tiny", label: "Rápida (tiny)" },
    { value: "base", label: "Equilibrada (base)" },
    { value: "small", label: "Mais precisa (small)" },
    { value: "medium", label: "Alta precisão (medium)" },
    { value: "large", label: "Máxima precisão (large)" },
];

const LANGUAGE_LABELS: Record<string, string> = {
    auto: "Detectar automaticamente",
    pt: "Português",
    en: "English",
    es: "Español",
};

const SELECT_CLASS = "mt-1.5 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:bg-neutral-800 dark:focus:ring-blue-900";

export function GenerateTranscription({
    selectedModel,
    selectedLanguage,
    availableLanguages,
    isBusy,
    isGenerating,
    onModelChange,
    onLanguageChange,
    onGenerate,
}: GenerateTranscriptionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]));

    return (
        <section className="pt-5 dark:border-neutral-800">
            <div className="text-left">
                <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Gerar nova transcrição</h4>
                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-expanded={isOpen}
                        aria-controls="transcription-generation"
                        aria-label={isOpen ? "Recolher geração de transcrição" : "Expandir geração de transcrição"}
                        className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 ${isOpen ? "rotate-180" : ""}`}
                    >
                        <svg viewBox="0 0 20 20" fill="none" className="size-4">
                            <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Escolha o modelo e o idioma usados pela IA.
                </p>
            </div>

            {isOpen && (
                <div id="transcription-generation" className="mt-4 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Modelo de transcrição
                            <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                                {MODEL_OPTIONS.map((model) => <option key={model.value} value={model.value}>{model.label}</option>)}
                            </select>
                        </label>
                        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Idioma da transcrição
                            <select value={selectedLanguage || "auto"} onChange={(event) => onLanguageChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                                {languageOptions.map((language) => (
                                    <option key={language} value={language}>{LANGUAGE_LABELS[language] ?? language.toUpperCase()}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <button
                        type="button"
                        className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
                        onClick={onGenerate}
                        disabled={isBusy}
                    >
                        {isGenerating ? "Gerando transcrição..." : "Gerar transcrição por IA"}
                    </button>
                </div>
            )}
        </section>
    );
}
