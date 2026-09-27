// src/pages/Dashboard/components/TranscriptionEditor.tsx

import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { formatTimecode } from "src/core/utils/videoHelpers"

interface TranscriptionSegment {
    id: number
    start: number
    end: number
    text: string
}

interface TranscriptionEditorProps {
    transcriptionDraft: string
    transcriptionMessage: string
    segments: TranscriptionSegment[]
    hasTranscription: boolean
    hasChanges: boolean
    isBusy: boolean
    onDraftChange: (value: string) => void
    onSave: () => void
    onDelete: () => void
    onGenerate: () => void
    onSeek: (seconds: number) => void
}

export function TranscriptionEditor({
    transcriptionDraft,
    transcriptionMessage,
    segments,
    hasTranscription,
    hasChanges,
    isBusy,
    onDraftChange,
    onSave,
    onDelete,
    //onGenerate,
    onSeek,
}: TranscriptionEditorProps) {

    return (
        <section className="group">
            <div className="flex items-start">
                <div className="mt-1 h-5 shrink-0 bg-transparent transition-colors" />

                <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                        Editor de transcrição
                    </h3>

                </div>
            </div>

            <textarea
                className="mt-6 min-h-30 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                value={transcriptionDraft}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder={transcriptionMessage}
            />


            {segments.length > 0 && (
                <div className="mt-6 flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                    {segments.map((segment) => (
                        <button
                            key={`${segment.id}-${segment.start}`}
                            type="button"
                            className="flex gap-4 border-b border-neutral-200 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-blue-50/50"
                            onClick={() => onSeek(segment.start)}
                        >
                            <span className="shrink-0 text-xs font-medium text-neutral-500">
                                {formatTimecode(segment.start)} - {formatTimecode(segment.end)}
                            </span>

                            <span className="text-sm leading-6 text-neutral-700">
                                {segment.text}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <ConfirmationDialog
                    title="Excluir transcrição"
                    message="Tem certeza que deseja excluir esta transcrição? Essa ação não pode ser desfeita."
                    onConfirm={onDelete}
                >
                    {(open) => (
                        <button
                            type="button"
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={open}
                            disabled={isBusy || !hasTranscription}
                        >
                            Excluir transcrição
                        </button>
                    )}
                </ConfirmationDialog>

                <button
                    type="button"
                    className="cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                    onClick={onSave}
                    disabled={isBusy || !hasChanges}
                >
                    Salvar transcrição
                </button>
            </div>
        </section>
    )
}
