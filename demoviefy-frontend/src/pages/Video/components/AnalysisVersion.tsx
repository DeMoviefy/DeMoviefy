// src/pages/Dashboard/components/AnalysisVersion.tsx

import { memo } from "react"
import { formatVariantLabel } from "src/core/utils/videoHelpers"
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisVersionProps = {
    message: string
    variants: NonNullable<VideoAnalysisResponse["available_variants"]>
    selectedVariantId: string | null
    onVariantChange: (variantId: string | null) => void
    onDelete: () => void;

}

export const AnalysisVersion = memo(function AnalysisVersion({
    message,
    variants,
    selectedVariantId,
    onVariantChange,
    onDelete
}: AnalysisVersionProps) {

    return (
        <div>
            {(message || variants.length === 0) && (
                <p className="mt-2 text-xs leading-5 text-neutral-400" aria-live="polite">
                    {message || "Nenhuma análise disponível."}
                </p>
            )}

            {variants.length > 0 && (
                <div className="flex w-full items-end gap-4">
                    <label className="min-w-0 flex-1">
                        <span className="mb-1.5 block text-xs font-medium text-neutral-500">
                            Versão da análise
                        </span>

                        <select
                            value={selectedVariantId ?? ""}
                            onChange={(e) => onVariantChange(e.target.value || null)}
                            className="max-w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        >
                            {variants.map((variant) => (
                                <option key={variant.variant_id} value={variant.variant_id}>
                                    {formatVariantLabel(variant)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <ConfirmationDialog
                        title="Excluir análise"
                        message={
                            variants.length > 1
                                ? "Tem certeza de que deseja excluir a análise selecionada?"
                                : "Tem certeza de que deseja excluir a análise deste vídeo?"
                        }
                        onConfirm={onDelete}
                    >
                        {(open) => (
                            <button
                                type="button"
                                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={open}
                            >
                                Excluir análise
                            </button>
                        )}
                    </ConfirmationDialog>
                </div>
            )}
        </div>
    )
})
