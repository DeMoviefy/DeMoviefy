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
                            className="text-sm font-medium text-neutral-500 transition-colors hover:text-red-600"
                            onClick={open}
                            disabled={isBusy}
                        >
                            Excluir transcrição
                        </button>
                    )}
                </ConfirmationDialog>

                <button
                    type="button"
                    className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={onSave}
                    disabled={isBusy}
                >
                    Salvar transcrição
                </button>
            </div>
        </section>
    )
}
