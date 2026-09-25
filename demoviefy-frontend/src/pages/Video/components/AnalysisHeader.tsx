// src/pages/Dashboard/components/AnalysisHeader.tsx

import { memo } from "react"
import { formatVariantLabel } from "src/core/utils/videoHelpers"
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisHeaderProps = {
    message: string
    variants: NonNullable<VideoAnalysisResponse["available_variants"]>
    selectedVariantId: string | null
    onVariantChange: (variantId: string | null) => void
    onDelete: () => void;

}

export const AnalysisHeader = memo(function AnalysisHeader({
    message,
    variants,
    selectedVariantId,
    onVariantChange,
    onDelete
}: AnalysisHeaderProps) {

    return (
        <div className="pb-5">
            <p className="text-sm leading-6 text-neutral-600">
                {message}
            </p>

            <div className="mt-4 flex w-full items-end gap-4">
                {variants.length > 0 && (<>
                    <label className="min-w-0 flex-1">
                        <span className="mb-1.5 block text-xs font-medium text-neutral-500">
                            Versão da análise
                        </span>

                        <select
                            value={selectedVariantId ?? ""}
                            onChange={(e) => onVariantChange(e.target.value || null)}
                            className="max-w-l border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-blue-400"
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
                                className="shrink-0 pb-2 text-sm font-medium text-neutral-500 transition-colors hover:text-red-600"
                                onClick={open}
                            >
                                Excluir análise
                            </button>
                        )}
                    </ConfirmationDialog>
                </>
                )}
            </div>
        </div>
    )
})