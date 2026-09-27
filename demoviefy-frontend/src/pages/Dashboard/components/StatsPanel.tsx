// src/pages/Dashboard/components/StatsPanel.tsx

interface StatsPanelProps {
  total: number;
  processing: number;
  processed: number;
  errors: number;
}

export function StatsPanel({
  total,
  processing,
  processed,
  errors,
}: StatsPanelProps) {
  return (
    <section className="grid grid-cols-4 gap-4 pb-2">
      <div>
        <span className="text-xs font-medium text-neutral-500 sm:text-sm">
          Vídeos
        </span>

        <strong className="mt-1.5 block text-2xl font-semibold tracking-tight text-neutral-900">
          {total}
        </strong>
      </div>

      <div>
        <span className="text-xs font-medium text-blue-700 sm:text-sm">
          Processando
        </span>

        <strong className="mt-1.5 block text-2xl font-semibold tracking-tight text-neutral-900">
          {processing}
        </strong>
      </div>

      <div>
        <span className="text-xs font-medium text-green-700 sm:text-sm">
          Concluídos
        </span>

        <strong className="mt-1.5 block text-2xl font-semibold tracking-tight text-neutral-900">
          {processed}
        </strong>
      </div>

      <div>
        <span className="text-xs font-medium text-red-700 sm:text-sm">
          Erros
        </span>

        <strong className="mt-1.5 block text-2xl font-semibold tracking-tight text-neutral-900">
          {errors}
        </strong>
      </div>
    </section>
  );
}
