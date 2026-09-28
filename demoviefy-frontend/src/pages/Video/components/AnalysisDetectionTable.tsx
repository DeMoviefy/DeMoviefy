// src/pages/Video/components/AnalysisDetectionTable.tsx

import { memo, useState } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { formatPercent } from "src/core/utils/videoHelpers";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";

type AnalysisDetectionTableProps = {
    summary: NonNullable<VideoAnalysisResponse["analysis"]>;
};

export const AnalysisDetectionTable = memo(function AnalysisDetectionTable({
    summary,
}: AnalysisDetectionTableProps) {
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const labels = Object.entries(summary.label_counts).sort(([labelA, countA], [labelB, countB]) => {
        if (countA === countB) return labelA.localeCompare(labelB, "pt-BR");
        return sortDirection === "desc" ? countB - countA : countA - countB;
    });
    return (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="h-48 overflow-auto">
                <table className="h-full w-full min-w-96 border-separate border-spacing-0 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                        <tr>
                            <th scope="col" className="px-3 py-3.5">
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

                    <tbody className="divide-y divide-neutral-100 text-neutral-700 dark:divide-neutral-700 dark:text-neutral-300">
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
                                        className="px-3 py-3.5 font-medium text-neutral-900 dark:text-neutral-100"
                                    >
                                        {label}
                                    </th>
                                    <td className="px-5 py-3.5 text-right tabular-nums">
                                        {formatPercent(summary.avg_confidence_by_label[label])}
                                    </td>
                                    <td className="px-5 py-3.5 text-right tabular-nums">
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
