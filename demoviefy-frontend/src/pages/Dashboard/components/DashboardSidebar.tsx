import { useTranslation } from "react-i18next";
import { useProcessingStore } from "src/core/stores/useProcessingStore";

import { DashboardVideoLibrary } from "src/pages/Dashboard/components/DashboardVideoLibrary";

export function DashboardSidebar() {
  const { t } = useTranslation();
  const videos = useProcessingStore((state) => state.videos);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col">
      <div className="pb-2">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t("library")}
        </h2>
      </div>

      <DashboardVideoLibrary videos={videos} />
    </aside>
  );
}
