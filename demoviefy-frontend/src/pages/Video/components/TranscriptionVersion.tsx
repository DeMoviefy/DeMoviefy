import type { VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog";

type TranscriptionVersionProps = {
    variants: NonNullable<VideoTranscriptionResponse["variants"]>;
    selectedVariant: string;
    onVariantChange: (variant: string) => void;
    hasTranscription: boolean;
    onDelete: () => void;
    disabled: boolean;
};

export function TranscriptionVersion({
    variants,
    selectedVariant,
    onVariantChange,
    hasTranscription,
    onDelete,
    disabled,
}: TranscriptionVersionProps) {
    return (
        <div className="mt-5 flex min-w-0 items-end gap-3">
            <label className="block min-w-0 flex-1">
                <span className="mb-1.5 block text-xs font-medium text-neutral-500">
                    Versão da transcrição
                </span>
                <select
                    value={selectedVariant}
                    onChange={(event) => onVariantChange(event.target.value)}
                    className="max-w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={disabled}
                >
                    {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>{variant.label}</option>
                    ))}
                </select>
            </label>
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
                        disabled={disabled || !hasTranscription}
                    >
                        Excluir transcrição
                    </button>
                )}
            </ConfirmationDialog>
        </div>
    );
}
