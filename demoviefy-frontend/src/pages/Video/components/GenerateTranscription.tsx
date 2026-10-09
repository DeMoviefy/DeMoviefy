type GenerateTranscriptionProps = {
    selectedModel: string;
    selectedLanguage: string;
    availableLanguages: string[];
    isBusy: boolean;
    isGenerating: boolean;
    transcriptionProgress: number | null;
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

const SELECT_CLASS = "mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900";

export function GenerateTranscription({
    selectedModel,
    selectedLanguage,
    availableLanguages,
    isBusy,
    isGenerating,
    transcriptionProgress,
    onModelChange,
    onLanguageChange,
    onGenerate,
}: GenerateTranscriptionProps) {
    const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]));

    return (
        <div>
            <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Gerar nova transcrição</h4>
            <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                Escolha o modelo e o idioma para criar uma nova versão.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Modelo de transcrição
                    <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                        {MODEL_OPTIONS.map((model) => <option key={model.value} value={model.value}>{model.label}</option>)}
                    </select>
                </label>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Idioma da transcrição
                    <select value={selectedLanguage || "auto"} onChange={(event) => onLanguageChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                        {languageOptions.map((language) => (
                            <option key={language} value={language}>{LANGUAGE_LABELS[language] ?? language.toUpperCase()}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    className="cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
                    onClick={onGenerate}
                    disabled={isBusy}
                >
                    {isGenerating ? "Gerando transcrição..." : "Gerar transcrição por IA"}
                </button>
            </div>
            {isGenerating && (
                <div className="mt-3">
                    <div className="mb-1 flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
                        <span>Progresso da transcrição</span>
                        <span>{transcriptionProgress ?? 0}%</span>
                    </div>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
                        role="progressbar"
                        aria-label="Progresso da transcrição"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={transcriptionProgress ?? 0}
                    >
                        <div
                            className="h-full rounded-full bg-blue-600 transition-[width] duration-300 dark:bg-blue-400"
                            style={{ width: `${transcriptionProgress ?? 0}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
