type VideoAnalysisConfigProps = {
    taskType: string
    modelPath: string
    frameStride: string | number
    confidenceThreshold: string | number
    maxFrames: string | number
    clipStart: string | number
    clipEnd: string | number | null
  
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
    onFrameStrideChange: (value: string) => void
    onConfidenceChange: (value: string) => void
    onMaxFramesChange: (value: string) => void
    onClipStartChange: (value: string) => void
    onClipEndChange: (value: string) => void
  }
  
export function VideoAnalysisConfig({
  taskType,
  modelPath,
  frameStride,
  confidenceThreshold,
  maxFrames,
  clipStart,
  clipEnd,
  tasks,
  models,
  onTaskChange,
  onModelChange,
  onFrameStrideChange,
  onConfidenceChange,
  onMaxFramesChange,
  onClipStartChange,
  onClipEndChange,
}: VideoAnalysisConfigProps) {
  const filteredModels = models.filter(
    (model) => model.task_type === taskType
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="group border-t border-neutral-200 pt-8 transition-transform duration-200 hover:translate-x-1">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-5 w-1 shrink-0 bg-transparent transition-colors group-hover:bg-blue-600" />
  
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Configuração
            </h3>
  
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Defina como o vídeo será processado.
            </p>
          </div>
        </div>
  
        <div className="mt-6 grid gap-6 border border-blue-100 bg-blue-50/50 p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="video-analysis-task"
              className="text-sm font-medium text-neutral-700"
            >
              Tarefa IA
            </label>
  
            <select
              id="video-analysis-task"
              value={taskType}
              onChange={(e) => onTaskChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            >
              <option value="">Selecione uma tarefa</option>
  
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
                className="text-sm font-medium text-neutral-700"
              >
                Modelo
              </label>
  
              <select
                id="video-analysis-model"
                value={modelPath}
                onChange={(e) => onModelChange(e.target.value)}
                className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
              >
                <option value="">Selecione um modelo</option>
  
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
  
      <div className="group border-t border-neutral-200 pt-8 transition-transform duration-200 hover:translate-x-1">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-5 w-1 shrink-0 bg-transparent transition-colors group-hover:bg-blue-600" />
  
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Parâmetros
            </h3>
          </div>
        </div>
  
        <div className="mt-6 grid gap-6 border border-neutral-200 bg-neutral-50 p-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="video-analysis-stride"
              className="text-sm font-medium text-neutral-700"
            >
              Stride
            </label>
  
            <input
              id="video-analysis-stride"
              type="number"
              min="1"
              max="30"
              value={frameStride}
              onChange={(e) => onFrameStrideChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            />
          </div>
  
          <div>
            <label
              htmlFor="video-analysis-confidence"
              className="text-sm font-medium text-neutral-700"
            >
              Confiança
            </label>
  
            <input
              id="video-analysis-confidence"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => onConfidenceChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            />
          </div>
  
          <div>
            <label
              htmlFor="video-analysis-max-frames"
              className="text-sm font-medium text-neutral-700"
            >
              Max Frames
            </label>
  
            <input
              id="video-analysis-max-frames"
              type="number"
              min="1"
              max="600"
              value={maxFrames}
              onChange={(e) => onMaxFramesChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>
      </div>
  
      <div className="group border-t border-neutral-200 pt-8 transition-transform duration-200 hover:translate-x-1">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-5 w-1 shrink-0 bg-transparent transition-colors group-hover:bg-blue-600" />
  
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Trecho do vídeo
            </h3>
  
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Opcionalmente, defina o intervalo que será analisado.
            </p>
          </div>
        </div>
  
        <div className="mt-6 grid gap-6 border border-neutral-200 bg-neutral-50 p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="video-analysis-clip-start"
              className="text-sm font-medium text-neutral-700"
            >
              Começo (s)
            </label>
  
            <input
              id="video-analysis-clip-start"
              type="number"
              min="0"
              value={clipStart}
              onChange={(e) => onClipStartChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
            />
          </div>
  
          <div>
            <label
              htmlFor="video-analysis-clip-end"
              className="text-sm font-medium text-neutral-700"
            >
              Fim (s)
            </label>
  
            <input
              id="video-analysis-clip-end"
              type="number"
              min="0"
              value={clipEnd ?? ""}
              onChange={(e) => onClipEndChange(e.target.value)}
              className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500"
              placeholder="Vídeo inteiro"
            />
          </div>
        </div>
      </div>
    </div>
  )
}