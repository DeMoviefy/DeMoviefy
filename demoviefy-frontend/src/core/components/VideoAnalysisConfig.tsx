import { useTranslation } from "react-i18next";

export const TASK_TRANSLATION_KEYS = {
  object_detection: "task_object_detection",
  image_classification: "task_image_classification",
  instance_segmentation: "task_instance_segmentation",
  oriented_bounding_boxes: "task_oriented_bounding_boxes",
  pose_estimation: "task_pose_estimation",
} as const;

type VideoAnalysisConfigProps = {
    taskType: string
    modelPath: string
    clipStart: string | number
    clipEnd: string | number | null
    frameStride: string | number
  
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
    onFrameStrideChange: (value: string) => void
  }
  
export function VideoAnalysisConfig({
  taskType,
  modelPath,
  clipStart,
  clipEnd,
  frameStride,
  tasks,
  models,
  onTaskChange,
  onModelChange,
  onClipStartChange,
  onClipEndChange,
  onFrameStrideChange,
}: VideoAnalysisConfigProps) {
  const { t } = useTranslation();
  const filteredModels = models.filter(
    (model) => model.task_type === taskType
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="pt-2">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {t("configuration")}
            </h3>
  
            <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {t("configDescription")}
            </p>
          </div>
        </div>
  
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="video-analysis-frame-stride" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Stride de frames
            </label>
            <select
              id="video-analysis-frame-stride"
              value={frameStride}
              onChange={(e) => onFrameStrideChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            >
              {[1, 8, 24, 30, 60].map((stride) => (
                <option key={stride} value={stride}>{stride === 1 ? "1 frame (todos os frames)" : `${stride} frames`}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="video-analysis-task"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("aiTask")}
            </label>
  
            <select
              id="video-analysis-task"
              value={taskType}
              onChange={(e) => onTaskChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            >
              <option value="">{t("selectTask")}</option>
  
              {tasks.map((task) => (
                <option key={task.task_type} value={task.task_type}>
                  {task.task_type in TASK_TRANSLATION_KEYS
                    ? t(TASK_TRANSLATION_KEYS[task.task_type as keyof typeof TASK_TRANSLATION_KEYS])
                    : task.task_label}
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
                {t("model")}
              </label>
  
              <select
                id="video-analysis-model"
                value={modelPath}
                onChange={(e) => onModelChange(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              >
                <option value="">{t("selectModel")}</option>
  
                {filteredModels.map((model) => (
                  <option key={model.relative_path} value={model.relative_path}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

  
      <div className="pt-6">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {t("videoSegment")}
            </h3>
  
            <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {t("segmentDescription")}
            </p>
          </div>
        </div>
  
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="video-analysis-clip-start"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("startSeconds")}
            </label>
  
            <input
              id="video-analysis-clip-start"
              type="number"
              min="0"
              value={clipStart}
              onChange={(e) => onClipStartChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            />
          </div>
  
          <div>
            <label
              htmlFor="video-analysis-clip-end"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {t("endSeconds")}
            </label>
  
            <input
              id="video-analysis-clip-end"
              type="number"
              min="0"
              value={clipEnd ?? ""}
              onChange={(e) => onClipEndChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              placeholder={t("fullVideo")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

