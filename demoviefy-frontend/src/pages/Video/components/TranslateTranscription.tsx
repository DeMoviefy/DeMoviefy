import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";

type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];

type TranslateTranscriptionProps = {
    sourceLanguage: string;
    hasTranscription: boolean;
    variants: TranscriptionVariant[];
    selectedVariant: string;
    isBusy: boolean;
    isTranslating: boolean;
    onTranslate: (sourceVariant: string, targetLanguage: string) => void;
};

const LANGUAGES = ["pt", "en", "es"];
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

export function TranslateTranscription({
    sourceLanguage,
    hasTranscription,
    variants,
    selectedVariant,
    isBusy,
    isTranslating,
    onTranslate,
}: TranslateTranscriptionProps) {
    const { t } = useTranslation();
    const [targetLanguage, setTargetLanguage] = useState("en");
    const [sourceVariant, setSourceVariant] = useState(selectedVariant);
    useEffect(() => setSourceVariant(selectedVariant), [selectedVariant]);
    const selectedSourceLanguage = variants.find((variant) => variant.id === sourceVariant)?.language
        ?? (sourceVariant === selectedVariant ? sourceLanguage : "");

    return (
        <section>
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-4 pt-5 dark:border-neutral-700 dark:bg-neutral-900/60 sm:p-5">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {t("translateTranscription")}
                </h4>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {t("translateFromSelected")}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {t("transcriptionVersionToTranslate")}
                        <select
                            value={hasTranscription ? sourceVariant : ""}
                            onChange={(event) => setSourceVariant(event.target.value)}
                            className={SELECT_CLASS}
                            disabled={isBusy || !hasTranscription}
                        >
                            {hasTranscription
                                ? variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)
                                : <option value="">{t("noTranscriptionAvailable")}</option>}
                        </select>
                    </label>

                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {t("translationLanguage")}
                        <select
                            value={targetLanguage}
                            onChange={(event) => setTargetLanguage(event.target.value)}
                            className={SELECT_CLASS}
                            disabled={isBusy || !hasTranscription}
                        >
                            {LANGUAGES.map((language) => (
                                <option key={language} value={language}>{getNativeLanguageName(language)}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700"
                        onClick={() => onTranslate(sourceVariant, targetLanguage)}
                        disabled={isBusy || !hasTranscription || !selectedSourceLanguage || selectedSourceLanguage === targetLanguage}
                        title={selectedSourceLanguage === targetLanguage ? t("sameLanguage") : undefined}
                    >
                        {isTranslating ? t("translating") : t("translate")}
                    </button>
                </div>
            </div>
        </section>
    );
}
