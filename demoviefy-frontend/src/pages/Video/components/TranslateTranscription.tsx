import { useState } from "react";

type TranslateTranscriptionProps = {
    sourceLanguage: string;
    hasTranscription: boolean;
    isBusy: boolean;
    isTranslating: boolean;
    onTranslate: (targetLanguage: string) => void;
};

const LANGUAGES = ["pt", "en", "es"];
const SELECT_CLASS = "mt-1.5 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";

export function TranslateTranscription({
    sourceLanguage,
    hasTranscription,
    isBusy,
    isTranslating,
    onTranslate,
}: TranslateTranscriptionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState("en");

    return (
        <section className="border-t border-neutral-100 pt-5">
            <div className="text-left">
                <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-neutral-900">Traduzir transcrição</h4>
                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-expanded={isOpen}
                        aria-controls="transcription-translation"
                        aria-label={isOpen ? "Recolher tradução" : "Expandir tradução"}
                        className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isOpen ? "rotate-180" : ""}`}
                    >
                        <svg viewBox="0 0 20 20" fill="none" className="size-4">
                            <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Traduza a partir da versão da transcrição selecionada.
                </p>
            </div>

            {isOpen && (
                <div id="transcription-translation" className="mt-4 rounded-lg border border-neutral-200 bg-white px-3 py-5 shadow-sm">
                    <label className="block max-w-sm text-xs font-medium text-neutral-500">
                        Idioma da tradução
                        <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className={SELECT_CLASS} disabled={isBusy}>
                            {LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}
                        </select>
                    </label>
                    <button
                        type="button"
                        className="mt-4 cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => onTranslate(targetLanguage)}
                        disabled={isBusy || !hasTranscription || !sourceLanguage || sourceLanguage === targetLanguage}
                        title={sourceLanguage === targetLanguage ? "A transcrição já está nesse idioma." : undefined}
                    >
                        {isTranslating ? "Traduzindo..." : "Traduzir"}
                    </button>
                </div>
            )}
        </section>
    );
}
