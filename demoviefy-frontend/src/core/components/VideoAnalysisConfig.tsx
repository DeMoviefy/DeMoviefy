import { useEffect, useRef, useState } from "react";
import { MAX_CLIP_DURATION_SECONDS, VideoClipRange } from "src/core/components/VideoClipRange";
import { toApiUrl } from "src/core/services/api";
import { formatVideoModelName, getVideoModelSizeOrder } from "src/core/utils/videoHelpers";

type VideoAnalysisConfigProps = {
    taskType: string
    modelPath: string
    clipStart: string | number
    clipEnd: string | number | null
    videoSource: File | string | null
    knownDurationSeconds?: number | null
  
    tasks: {
      task_type: string
      task_label: string
    }[]
  
    models: {
      task_type: string
      relative_path: string
      name: string
    }[]
  
    onTaskChange: (value: string) => void
    onModelChange: (value: string) => void
    onClipStartChange: (value: string) => void
    onClipEndChange: (value: string) => void
  }
  
export function VideoAnalysisConfig({
  taskType,
  modelPath,
  clipStart,
  clipEnd,
  videoSource,
  knownDurationSeconds = null,
  tasks,
  models,
  onTaskChange,
  onModelChange,
  onClipStartChange,
  onClipEndChange,
}: VideoAnalysisConfigProps) {
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [durationLimitReached, setDurationLimitReached] = useState(false);
  const clipConfigRef = useRef({ clipStart, clipEnd, onClipStartChange, onClipEndChange });
  clipConfigRef.current = { clipStart, clipEnd, onClipStartChange, onClipEndChange };
  const filteredModels = models
    .filter((model) => model.task_type === taskType)
    .sort((a, b) => getVideoModelSizeOrder(a.name) - getVideoModelSizeOrder(b.name))

  useEffect(() => {
    setDurationSeconds(null);
    setDurationLimitReached(false);
    const applyDuration = (actualDuration: number) => {
      if (!Number.isFinite(actualDuration) || actualDuration <= 0) return;
      const limitReached = actualDuration > MAX_CLIP_DURATION_SECONDS;
      setDurationSeconds(Math.min(actualDuration, MAX_CLIP_DURATION_SECONDS));
      setDurationLimitReached(limitReached);

      if (limitReached) {
        const { clipStart: currentStart, clipEnd: currentEnd, onClipStartChange, onClipEndChange } = clipConfigRef.current;
        const startSeconds = Number(currentStart) || 0;
        const endSeconds = currentEnd === null || currentEnd === "" ? null : Number(currentEnd);
        if (startSeconds >= MAX_CLIP_DURATION_SECONDS) {
          onClipStartChange(String(MAX_CLIP_DURATION_SECONDS - 1));
          onClipEndChange(String(MAX_CLIP_DURATION_SECONDS));
        } else if (endSeconds === null || endSeconds > MAX_CLIP_DURATION_SECONDS) {
          onClipEndChange(String(MAX_CLIP_DURATION_SECONDS));
        }
      }
    };

    if (knownDurationSeconds !== null && knownDurationSeconds > 0) {
      applyDuration(knownDurationSeconds);
      return;
    }
    if (!videoSource) return;

    const media = document.createElement("video");
    media.preload = "metadata";
    let objectUrl: string | null = null;
    if (typeof videoSource === "string") {
      media.src = toApiUrl(videoSource);
    } else {
      objectUrl = URL.createObjectURL(videoSource);
      media.src = objectUrl;
    }
    media.onloadedmetadata = () => applyDuration(media.duration);

    return () => {
      media.onloadedmetadata = null;
      media.removeAttribute("src");
      media.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoSource, knownDurationSeconds]);

  return (
    <div className="flex flex-col gap-6">
      <div className="pt-2">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Configuração
            </h3>
  
            <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              Defina como o vídeo será processado.
            </p>
          </div>
        </div>
  
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="video-analysis-task"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Tipo de análise
            </label>
  
            <select
              id="video-analysis-task"
              value={taskType}
              onChange={(e) => onTaskChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            >
              {tasks.map((task) => (
                <option key={task.task_type} value={task.task_type}>
                  {task.task_label}
                </option>
              ))}
            </select>
          </div>
  
          {taskType && (
            <div>
              <label
                htmlFor="video-analysis-model"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Precisão da análise
              </label>
  
              <select
                id="video-analysis-model"
                value={modelPath}
                onChange={(e) => onModelChange(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              >
                {filteredModels.map((model) => (
                  <option key={model.relative_path} value={model.relative_path}>
                    {formatVideoModelName(model.name)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

  
      <VideoClipRange
        durationSeconds={durationSeconds}
        durationLimitReached={durationLimitReached}
        start={clipStart}
        end={clipEnd}
        onStartChange={onClipStartChange}
        onEndChange={onClipEndChange}
      />
    </div>
  )
}
