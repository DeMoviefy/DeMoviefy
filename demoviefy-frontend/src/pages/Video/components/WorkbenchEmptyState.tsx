import { useTranslation } from "react-i18next";

export function WorkbenchEmptyState() {
  const { t } = useTranslation();
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <strong className="text-neutral-900 dark:text-neutral-100">{t("emptyWorkbenchTitle")}</strong>
      <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{t("emptyWorkbenchDescription")}</p>
    </section>
  )
}
