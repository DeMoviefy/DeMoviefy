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
            <div>        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-500" />
                Vídeos
            </span>

                <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {total}
                </strong>
            </div>

            <div>        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-blue-700 dark:bg-blue-400" />
                Processando
            </span>

                <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {processing}
                </strong>
            </div>

            <div>        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-green-700 dark:bg-green-400" />
                Concluídos
            </span>

                <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {processed}
                </strong>
            </div>

            <div>        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-red-700 dark:bg-red-400" />
                Erros
            </span>

                <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {errors}
                </strong>
            </div>
        </section>
    );
}
