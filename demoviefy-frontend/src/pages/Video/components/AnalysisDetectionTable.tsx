// src/pages/Video/components/AnalysisDetectionTable.tsx

import { memo } from "react";
import { formatPercent } from "src/core/utils/videoHelpers";
import type { VideoAnalysisResponse } from "src/core/types/videoTypes";

type AnalysisDetectionTableProps = {
  summary: NonNullable<VideoAnalysisResponse["analysis"]>;
};

export const AnalysisDetectionTable = memo(function AnalysisDetectionTable({
  summary,
}: AnalysisDetectionTableProps) {
  const labels = Object.entries(summary.label_counts);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-96 border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Classe
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Ocorrências
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Confiança média
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {labels.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-8 text-center text-sm text-neutral-400"
                >
                  Nenhuma detecção encontrada
                </td>
              </tr>
            ) : (
              labels.map(([label, count]) => (
                <tr key={label} className="transition-colors hover:bg-neutral-50">
                  <th
                    scope="row"
                    className="px-5 py-3.5 font-medium text-neutral-900"
                  >
                    {label}
                  </th>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    {count}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    {formatPercent(summary.avg_confidence_by_label[label])}
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
