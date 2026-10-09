import { useEffect, useState } from "react";
import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { formatSrtTime } from "src/core/utils/videoHelpers";

type TranscriptionSegment = VideoTranscriptionResponse["transcription"]["segments"][number];

type TranscriptionTextEditorProps = {
    draft: string;
    message: string;
    segments: TranscriptionSegment[];
    hasChanges: boolean;
    isBusy: boolean;
    selectedVariant: string;
    onDraftChange: (value: string) => void;
    onSegmentsChange: (segments: TranscriptionSegment[]) => void;
    onSave: () => void | Promise<void>;
};

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

export function TranscriptionTextEditor({
    draft,
    message,
    segments,
    hasChanges,
    isBusy,
    selectedVariant,
    onDraftChange,
    onSegmentsChange,
    onSave,
}: TranscriptionTextEditorProps) {
    const [srtDraft, setSrtDraft] = useState(() => formatSrt(segments, draft));

    useEffect(() => {
        if (!hasChanges) setSrtDraft(formatSrt(segments, draft));
    }, [hasChanges, segments, draft, selectedVariant]);

    const handleChange = (value: string) => {
        setSrtDraft(value);
        onDraftChange(value);
        onSegmentsChange(parseSrt(value));
    };

    return (
        <div className="flex min-w-0 flex-col gap-3">
            <textarea
                className="min-h-30 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 read-only:cursor-default dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:bg-neutral-800 dark:focus:ring-blue-900"
                value={srtDraft}
                onChange={(event) => handleChange(event.target.value)}
                readOnly={isBusy}
                placeholder={message || "Não há uma transcrição disponível para este vídeo. Gere-a e depois confira-a neste editor."}
                spellCheck={false}
                aria-label="Transcrição no formato SRT"
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:bg-blue-800 dark:hover:bg-blue-700"
                    onClick={() => void onSave()}
                    disabled={isBusy || !hasChanges}
                >
                    Salvar transcrição
                </button>
            </div>
        </div>
    );
}
