import { useEffect, useState } from "react";

type VideoClipRangeProps = {
    boxed?: boolean;
    durationSeconds: number | null;
    durationLimitReached: boolean;
    start: string | number;
    end: string | number | null;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
};

export const MAX_CLIP_DURATION_SECONDS = 3 * 60 * 60;

const INPUT_GROUP_CLASS = "mt-1.5 flex min-h-11 w-full items-center rounded-md border border-neutral-200 bg-white px-3 py-2.5 outline-none transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-900";
const RANGE_CLASS = "pointer-events-none absolute left-2 right-2 top-0 z-10 h-8 w-auto appearance-none bg-transparent disabled:opacity-50 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent";

function getTimeFormat(durationSeconds: number | null): "seconds" | "minutes" | "hours" {
    if (durationSeconds !== null && durationSeconds >= 3600) return "hours";
    return "minutes";
}

function formatTime(seconds: number, format: "seconds" | "minutes" | "hours"): string {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainder = safeSeconds % 60;
    if (format === "hours") {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    }
    if (format === "minutes") {
        return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    }
    return String(remainder).padStart(2, "0");
}

function parseTime(value: string, format: "seconds" | "minutes" | "hours"): number | null {
    const parts = value.trim().split(":");
    const expectedParts = format === "hours" ? 3 : format === "minutes" ? 2 : 1;
    if (parts.length !== expectedParts || parts.some((part) => !/^\d{1,2}$/.test(part))) return null;
    const numbers = parts.map(Number);
    if (format === "hours") {
        const [hours, minutes, seconds] = numbers;
        if (minutes > 59 || seconds > 59) return null;
        return hours * 3600 + minutes * 60 + seconds;
    }
    if (format === "minutes") {
        const [minutes, seconds] = numbers;
        if (seconds > 59) return null;
        return minutes * 60 + seconds;
    }
    return numbers[0];
}

function ClipTimeInput({
    label,
    value,
    format,
    min,
    max,
    onCommit,
}: {
    label: string;
    value: number;
    format: "seconds" | "minutes" | "hours";
    min: number;
    max: number;
    onCommit: (value: number) => void;
}) {
    const [draft, setDraft] = useState(formatTime(value, format));
    useEffect(() => setDraft(formatTime(value, format)), [value, format]);

    const commit = () => {
        const parsed = parseTime(draft, format);
        if (parsed === null) {
            setDraft(formatTime(value, format));
            return;
        }
        const boundedValue = Math.min(max, Math.max(min, parsed));
        onCommit(boundedValue);
        setDraft(formatTime(boundedValue, format));
    };

    return (
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
            <div className={INPUT_GROUP_CLASS}>
                <input
                    type="text"
                    inputMode="numeric"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={commit}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                        }
                    }}
                    placeholder={formatTime(0, format)}
                    aria-label={label}
                    className="h-5 min-w-0 bg-transparent text-sm leading-5 text-neutral-900 outline-none dark:text-neutral-100"
                    style={{ width: `${Math.max(2, draft.length + 0.5)}ch` }}
                />
            </div>
        </label>
    );
}

export function VideoClipRange({ boxed = true, durationSeconds, durationLimitReached, start, end, onStartChange, onEndChange }: VideoClipRangeProps) {
    const [activeHandle, setActiveHandle] = useState<"start" | "end">("end");
    const maxDuration = durationSeconds !== null && Number.isFinite(durationSeconds)
        ? Math.min(MAX_CLIP_DURATION_SECONDS, Math.max(0, Math.floor(durationSeconds)))
        : null;
    const startSeconds = Math.max(0, Math.floor(Number(start) || 0));
    const endSeconds = end === null || end === ""
        ? maxDuration ?? startSeconds
        : Math.max(0, Math.floor(Number(end) || 0));
    const effectiveEnd = maxDuration === null ? Math.max(startSeconds, endSeconds) : Math.min(maxDuration, Math.max(startSeconds, endSeconds));
    const boundedStart = Math.min(startSeconds, effectiveEnd);
    const timeFormat = getTimeFormat(maxDuration);
    const sliderAvailable = maxDuration !== null && maxDuration > 0;
    const startPosition = maxDuration ? (boundedStart / maxDuration) * 100 : 0;
    const endPosition = maxDuration ? (effectiveEnd / maxDuration) * 100 : 100;

    return (
        <div className={boxed ? "rounded-xl border border-neutral-200 bg-neutral-100 p-4 pt-5 dark:border-neutral-700 dark:bg-neutral-900/60 sm:p-5" : ""}>
            <div className="flex items-start gap-3">
                <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Trecho do vídeo</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                        Defina o intervalo da análise.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ClipTimeInput
                    label="Início"
                    value={boundedStart}
                    format={timeFormat}
                    min={0}
                    max={effectiveEnd}
                    onCommit={(value) => onStartChange(String(value))}
                />
                <ClipTimeInput
                    label="Fim"
                    value={effectiveEnd}
                    format={timeFormat}
                    min={boundedStart}
                    max={maxDuration ?? Number.MAX_SAFE_INTEGER}
                    onCommit={(value) => onEndChange(String(value))}
                />
            </div>

            <div className="mt-5">
                <div className="relative h-8" role="group" aria-label="Selecionar trecho do vídeo">
                    <div className="absolute inset-x-2 top-1/2 h-2 -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <div
                            className="absolute inset-y-0 rounded-full bg-blue-600 dark:bg-blue-400"
                            style={{ left: `${startPosition}%`, width: `${endPosition - startPosition}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={maxDuration ?? 0}
                        step={1}
                        value={boundedStart}
                        disabled={!sliderAvailable}
                        onPointerDown={() => setActiveHandle("start")}
                        onFocus={() => setActiveHandle("start")}
                        onChange={(event) => onStartChange(String(Math.min(Number(event.target.value), effectiveEnd)))}
                        aria-label="Início do trecho do vídeo"
                        aria-valuetext={formatTime(boundedStart, timeFormat)}
                        className={`${RANGE_CLASS} clip-range-start ${activeHandle === "start" ? "z-20" : ""}`}
                    />
                    <input
                        type="range"
                        min={0}
                        max={maxDuration ?? 0}
                        step={1}
                        value={effectiveEnd}
                        disabled={!sliderAvailable}
                        onPointerDown={() => setActiveHandle("end")}
                        onFocus={() => setActiveHandle("end")}
                        onChange={(event) => onEndChange(String(Math.max(Number(event.target.value), boundedStart)))}
                        aria-label="Fim do trecho do vídeo"
                        aria-valuetext={formatTime(effectiveEnd, timeFormat)}
                        className={`${RANGE_CLASS} clip-range-end ${activeHandle === "end" ? "z-20" : ""}`}
                    />
                </div>
            </div>
            {durationLimitReached && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    Vídeos com mais de 3 horas serão limitados às primeiras 3 horas.
                </p>
            )}
            {durationSeconds === null && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    A duração não foi detectada; o controle deslizante ficará disponível quando o vídeo puder ser lido.
                </p>
            )}
        </div>
    );
}
