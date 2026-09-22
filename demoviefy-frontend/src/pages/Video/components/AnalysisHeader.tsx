// src/pages/Dashboard/components/AnalysisHeader.tsx

import { memo } from "react"
import { formatVariantLabel } from "src/core/utils/videoHelpers"
import type { VideoAnalysisResponse } from "src/core/types/videoTypes"

type AnalysisHeaderProps = {
  message: string
  variants: NonNullable<VideoAnalysisResponse["available_variants"]>
  selectedVariantId: string | null
  onVariantChange: (variantId: string | null) => void
}

export const AnalysisHeader = memo(function AnalysisHeader({
  message,
  variants,
  selectedVariantId,
  onVariantChange,
}: AnalysisHeaderProps) {
  return (
    <div className="pb-5">
      <p className="text-sm leading-6 text-neutral-600">
        {message}
      </p>
  
      {variants.length > 0 && (
        <label className="mt-4 block max-w-md">
          <span className="mb-1.5 block text-xs font-medium text-neutral-500">
            Versão da análise
          </span>
  
          <select
            value={selectedVariantId ?? ""}
            onChange={(e) => onVariantChange(e.target.value || null)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-blue-400"
          >
            {variants.map((variant) => (
              <option key={variant.variant_id} value={variant.variant_id}>
                {formatVariantLabel(variant)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
})