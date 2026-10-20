import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-2 gap-3 pb-2 xl:grid-cols-4">
      <div>
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-500" />
          {t("videos")}
        </span>
        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {total}
        </strong>
      </div>

      <div>
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-blue-700 dark:bg-blue-400" />
          {t("processing")}
        </span>
        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {processing}
        </strong>
      </div>

      <div>
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-green-700 dark:bg-green-400" />
          {t("completed")}
        </span>
        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {processed}
        </strong>
      </div>

      <div>
        <span className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-red-700 dark:bg-red-400" />
          {t("errors")}
        </span>
        <strong className="mt-2 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {errors}
        </strong>
      </div>
    </section>
  );
}
