import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";
import type { i18nVideo } from "src/pages/Video/i18nVideo";

type TranscriptionVariant = NonNullable<VideoTranscriptionResponse["variants"]>[number];
type Translate = (key: keyof typeof i18nVideo.ptBR) => string;

const MODEL_LABEL_KEYS: Record<string, string> = {
    tiny: "modelFast",
    base: "modelBalanced",
    small: "modelPrecise",
    medium: "modelHigh",
    large: "modelMax",
};

const LANGUAGE_LABEL_KEYS: Record<string, string> = {
    pt: "transcriptionLanguagePortuguese",
    en: "transcriptionLanguageEnglish",
    es: "transcriptionLanguageSpanish",
};

function getLanguageLabel(language: string, t: Translate): string {
    const code = language.trim().split(/[-_]/)[0].toLowerCase();
    if (code === "auto") return t("detectAutomatically");
    if (LANGUAGE_LABEL_KEYS[code]) return t(LANGUAGE_LABEL_KEYS[code]);

    try {
        const nativeName = new Intl.DisplayNames([code], { type: "language" }).of(code);
        if (!nativeName) return language;
        const normalized = nativeName.toLocaleLowerCase(code);
        const [first, ...rest] = Array.from(normalized);
        return `${first.toLocaleUpperCase(code)}${rest.join("")}`;
    } catch {
        return language;
    }
}

export function formatTranscriptionVariantLabel(variant: TranscriptionVariant, t: Translate): string {
    if (variant.id === "default" && !variant.model_name) return t("primaryTranscription");

    const language = variant.language ? getLanguageLabel(variant.language, t) : t("detectAutomatically");
    const modelName = variant.model_name?.trim().toLowerCase();
    const model = modelName
        ? MODEL_LABEL_KEYS[modelName] ? t(MODEL_LABEL_KEYS[modelName]) : variant.model_name
        : "";
    return model ? `${language} - ${model}` : language;
}
