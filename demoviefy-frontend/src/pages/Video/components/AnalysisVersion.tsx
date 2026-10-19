// src/pages/Dashboard/components/AnalysisVersion.tsx

import { memo } from "react"
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { TASK_TRANSLATION_KEYS } from "src/core/components/VideoAnalysisConfig";
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
    const { t, i18n } = useTranslation();
    const formatLabel = (variant: NonNullable<VideoAnalysisResponse["available_variants"]>[number]) => {
        const taskKey = TASK_TRANSLATION_KEYS[variant.task_type as keyof typeof TASK_TRANSLATION_KEYS];
        const taskLabel = taskKey ? t(taskKey) : variant.task_label;
        const createdAt = variant.created_at
            ? new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, { dateStyle: "short", timeStyle: "medium" }).format(new Date(variant.created_at))
            : t("noDate");
        return `${taskLabel} - ${variant.model_name} - ${createdAt}`;
    };

    return (
        <div>
            {(message || variants.length === 0) && (
                <p className="mt-2 text-xs leading-5 text-neutral-400 dark:text-neutral-500" aria-live="polite">
                    {message}
                </p>
            )}

            {variants.length > 0 && (
                <div className="flex w-full items-end gap-4">
                    <label className="min-w-0 flex-1">
                        <span className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {t("analysisVersion")}
                        </span>

                        <select
                            value={selectedVariantId ?? ""}
                            onChange={(e) => onVariantChange(e.target.value || null)}
                            className="max-w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-blue-400 dark:focus:bg-neutral-800 dark:focus:ring-blue-900"
                        >
                            {variants.map((variant) => (
                                <option key={variant.variant_id} value={variant.variant_id}>
                                    {formatLabel(variant)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <ConfirmationDialog
                        title={t("deleteAnalysis")}
                        message={
                            variants.length > 1
                                ? t("deleteAnalysisSelectedConfirm")
                                : t("deleteAnalysisConfirm")
                        }
                        onConfirm={onDelete}
                    >
                        {(open) => (
                            <button
                                type="button"
                                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-900"
                                onClick={open}
                            >
                                {t("deleteAnalysis")}
                            </button>
                        )}
                    </ConfirmationDialog>
                </div>
            )}
        </div>
    )
})
