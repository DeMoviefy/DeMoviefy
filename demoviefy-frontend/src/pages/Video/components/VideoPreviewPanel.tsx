import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { VideoRecord, VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { createWebVtt } from "src/core/utils/videoHelpers";

type VideoTranscriptionTrack = {
    segments: VideoTranscriptionResponse["transcription"]["segments"];
    label: string;
    language: string;
};

const EMPTY_TRANSCRIPTION_SEGMENTS: VideoTranscriptionResponse["transcription"]["segments"] = [];

interface VideoPreviewPanelProps {
    video: VideoRecord;
    analysisState: "idle" | "loading" | "ready" | "pending" | "error";
    annotatedVideoSrc: string;
    hasSelectedAnalysis: boolean;
    transcriptionTrack: VideoTranscriptionTrack | null;
}

function getAnnotatedPreviewState(
    annotatedPlaybackError: boolean,
    isReprocessing: boolean,
    analysisState: string,
    hasSelectedAnalysis: boolean,
) {
    if (isReprocessing) {
        return {
            title: "previewProcessing",
            message: "previewProcessingMessage",
        };
    }
    if (annotatedPlaybackError && hasSelectedAnalysis) {
        return {
            title: "previewPlaybackError",
            message: "previewPlaybackErrorMessage",
        };
    }
    if (analysisState === "pending") {
        return {
            title: "previewPending",
            message: "previewPendingMessage",
        };
    }
    return {
        title: "previewUnavailable",
        message: "previewUnavailableMessage",
    };
}

export function VideoPreviewPanel({
    video,
    analysisState,
    annotatedVideoSrc,
    hasSelectedAnalysis,
    transcriptionTrack,
}: VideoPreviewPanelProps) {
    const { t } = useTranslation();
    const [annotatedPlaybackError, setAnnotatedPlaybackError] = useState(false);
    const [subtitleTrack, setSubtitleTrack] = useState<{
        segments: VideoTranscriptionTrack["segments"];
        url: string;
    } | null>(null);
    const subtitleTrackRef = useRef<HTMLTrackElement>(null);
    const transcriptionSegments = transcriptionTrack?.segments ?? EMPTY_TRANSCRIPTION_SEGMENTS;
    const activeSubtitleUrl = subtitleTrack?.segments === transcriptionSegments ? subtitleTrack.url : "";

    useEffect(() => {
        if (transcriptionSegments.length === 0) {
            setSubtitleTrack(null);
            return;
        }

        const url = URL.createObjectURL(new Blob([createWebVtt(transcriptionSegments)], { type: "text/vtt" }));
        setSubtitleTrack({ segments: transcriptionSegments, url });
        return () => URL.revokeObjectURL(url);
    }, [transcriptionSegments]);

    useEffect(() => {
        if (activeSubtitleUrl && subtitleTrackRef.current) {
            subtitleTrackRef.current.track.mode = "showing";
        }
    }, [activeSubtitleUrl]);

    useEffect(() => {
        setAnnotatedPlaybackError(false);
    }, [annotatedVideoSrc, video.id, video.status]);

    const isReprocessing = video.status.startsWith("PROCESSANDO");
    const canTryAnnotated = hasSelectedAnalysis && !annotatedPlaybackError;
    const previewState = getAnnotatedPreviewState(
        annotatedPlaybackError,
        isReprocessing,
        analysisState,
        hasSelectedAnalysis,
    );

    return (
        <article className="overflow-hidden rounded-lg bg-black shadow-sm">
            {canTryAnnotated ? (
                <video
                    key={annotatedVideoSrc}
                    className="aspect-video w-full object-contain"
                    controls
                    preload="metadata"
                    src={annotatedVideoSrc}
                    onError={() => setAnnotatedPlaybackError(true)}
                >
                    {activeSubtitleUrl && transcriptionTrack && (
                        <track
                            ref={subtitleTrackRef}
                            key={activeSubtitleUrl}
                            kind="subtitles"
                            src={activeSubtitleUrl}
                            srcLang={transcriptionTrack.language || "pt"}
                            label={`${t("transcription")}: ${transcriptionTrack.label}`}
                            default
                        />
                    )}
                    {t("videoUnsupported")}
                </video>
            ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-neutral-50 px-8 text-center dark:bg-neutral-800">
                    <strong className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t(previewState.title)}</strong>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500 dark:text-neutral-400">{t(previewState.message)}</p>
                </div>
            )}
        </article>
    );
}
