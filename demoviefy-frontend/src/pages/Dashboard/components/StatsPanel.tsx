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
    <section className="grid grid-cols-2 gap-3 pb-2 xl:grid-cols-4">
      <div className="rounded-lg bg-neutral-50 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-neutral-300" />
          Vídeos
        </span>

        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900">
          {total}
        </strong>
      </div>

      <div className="rounded-lg bg-neutral-50 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-blue-700" />
          Processando
        </span>

        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900">
          {processing}
        </strong>
      </div>

      <div className="rounded-lg bg-neutral-50 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-green-700" />
          Concluídos
        </span>

        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900">
          {processed}
        </strong>
      </div>

      <div className="rounded-lg bg-neutral-50 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-red-700" />
          Erros
        </span>

        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900">
          {errors}
        </strong>
      </div>
    </section>
  );
}
