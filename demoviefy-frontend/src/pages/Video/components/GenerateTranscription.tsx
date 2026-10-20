import { memo } from "react";
import { useTranslation } from "react-i18next";

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

const MODEL_TRANSLATION_KEYS = {
    tiny: "modelFast",
    base: "modelBalanced",
    small: "modelPrecise",
    medium: "modelHigh",
    large: "modelMax",
} as const;

const SELECT_CLASS = "mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900";

function getNativeLanguageName(language: string): string {
    const languageCode = language.trim().split(/[-_]/)[0].toLowerCase();
    if (!languageCode) return language;

    try {
        const nativeName = new Intl.DisplayNames([languageCode], { type: "language" }).of(languageCode);
        if (!nativeName) return language;
        const normalizedName = nativeName.toLocaleLowerCase(languageCode);
        const [firstCharacter, ...rest] = Array.from(normalizedName);
        return `${firstCharacter.toLocaleUpperCase(languageCode)}${rest.join("")}`;
    } catch {
        return language;
    }
}

export const GenerateTranscription = memo(function GenerateTranscription({
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
    const { t } = useTranslation();
    const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]));

    return (
        <section>
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-4 pt-5 dark:border-neutral-700 dark:bg-neutral-900/60 sm:p-5">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("generateTranscription")}
                </h4>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {t("transcriptionInstructions")}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {t("transcriptionModel")}
                        <select value={selectedModel} onChange={(event) => onModelChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                            {(Object.entries(MODEL_TRANSLATION_KEYS) as [keyof typeof MODEL_TRANSLATION_KEYS, string][]).map(([model, translationKey]) => (
                                <option key={model} value={model}>{t(translationKey)}</option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {t("transcriptionLanguage")}
                        <select value={selectedLanguage || "auto"} onChange={(event) => onLanguageChange(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                            {languageOptions.map((language) => (
                                <option key={language} value={language}>
                                    {language.toLowerCase() === "auto" ? t("detectAutomatically") : getNativeLanguageName(language)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {isGenerating && (
                    <div className="mt-3">
                        <div className="mb-1 flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
                            <span>{t("transcribingVideo")}</span>
                            <span>{transcriptionProgress ?? 0}%</span>
                        </div>
                        <div
                            className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
                            role="progressbar"
                            aria-label={t("processingProgress")}
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

                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
                        onClick={onGenerate}
                        disabled={isBusy}
                    >
                        {isGenerating ? t("generating") : t("generateAI")}
                    </button>
                </div>
            </div>
        </section>
    );
});
