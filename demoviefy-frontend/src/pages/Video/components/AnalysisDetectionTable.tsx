// src/pages/Video/components/AnalysisDetectionTable.tsx

import { memo, useState } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { formatPercent } from "src/core/utils/videoHelpers";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";

type AnalysisDetectionTableProps = {
    summary: NonNullable<VideoAnalysisResponse["analysis"]>;
    heading?: string;
};

export const AnalysisDetectionTable = memo(function AnalysisDetectionTable({
    summary,
    heading,
}: AnalysisDetectionTableProps) {
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const labels = Object.entries(summary.label_counts).sort(([labelA, countA], [labelB, countB]) => {
        if (countA === countB) return labelA.localeCompare(labelB, "pt-BR");
        return sortDirection === "desc" ? countB - countA : countA - countB;
    });
    return (
        <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/70">
            {heading && (
                <h3 className="bg-neutral-100 px-4 pb-4 pt-5 text-base font-semibold tracking-tight text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 sm:px-5 sm:pb-5 sm:pt-5">
                    {heading}
                </h3>
            )}
            <div className="h-[37.3rem] overflow-auto bg-white dark:bg-neutral-800">
                <table className="w-full min-w-96 border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-neutral-100 text-xs font-semibold tracking-wide text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                        <tr>
                            <th scope="col" className="px-4 py-3.5 sm:px-5">
                                Classe
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Confiança média
                            </th>

                            <th
                                scope="col"
                                aria-sort={sortDirection === "asc" ? "ascending" : "descending"}
                                className="px-5 py-3.5 text-right"
                            >
                                <button
                                    type="button"
                                    className="inline-flex cursor-pointer items-center gap-1.5 text-right transition-colors hover:text-blue-700 dark:hover:text-blue-400"
                                    aria-label={`Ordenar ocorrências em ordem ${sortDirection === "desc" ? "crescente" : "decrescente"}`}
                                    title={`Ordenar ocorrências em ordem ${sortDirection === "desc" ? "crescente" : "decrescente"}`}
                                    onClick={() => setSortDirection((direction) => direction === "desc" ? "asc" : "desc")}
                                >
                                    Ocorrências
                                    {sortDirection === "desc" ? (
                                        <FaSortAmountDown aria-hidden="true" className="size-3" />
                                    ) : (
                                        <FaSortAmountUp aria-hidden="true" className="size-3" />
                                    )}
                                </button>
                            </th>

                        </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 text-neutral-700 dark:divide-neutral-700 dark:text-neutral-300">
                        {labels.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-5 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500"
                                >
                                    Nenhuma detecção encontrada
                                </td>
                            </tr>
                        ) : (
                            labels.map(([label, count]) => (
                                <tr key={label} className="transition-colors hover:bg-blue-50/40 dark:hover:bg-neutral-700/50">
                                    <th
                                        scope="row"
                                        className="border-b border-neutral-200 px-4 py-5 font-medium text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 sm:px-5"
                                    >
                                        {label}
                                    </th>
                                    <td className="border-b border-neutral-200 px-5 py-5 text-right tabular-nums dark:border-neutral-700">
                                        {formatPercent(summary.avg_confidence_by_label[label])}
                                    </td>
                                    <td className="border-b border-neutral-200 px-5 py-5 text-right tabular-nums dark:border-neutral-700">
                                        {count}
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
