// src/pages/Dashboard/components/StatsPanel.tsx

interface StatsPanelProps {
  total: number
  processing: number
  processed: number
  errors: number
}

export function StatsPanel({ total, processing, processed, errors }: StatsPanelProps) {
  return (
    <section className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-slate-800 pb-8 md:grid-cols-4">
      <div>
        <span className="text-sm text-slate-400">Vídeos</span>
        <strong className="mt-1 block text-2xl font-semibold">
          {total}
        </strong>
      </div>

      <div>
        <span className="text-sm text-slate-400">Processando</span>
        <strong className="mt-1 block text-2xl font-semibold">
          {processing}
        </strong>
      </div>

      <div>
        <span className="text-sm text-slate-400">Concluídos</span>
        <strong className="mt-1 block text-2xl font-semibold">
          {processed}
        </strong>
      </div>

      <div>
        <span className="text-sm text-slate-400">Erros</span>
        <strong className="mt-1 block text-2xl font-semibold">
          {errors}
        </strong>
      </div>
    </section>
  );
}