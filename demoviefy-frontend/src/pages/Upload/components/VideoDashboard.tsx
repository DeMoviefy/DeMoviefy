// src/pages/Upload/components/VideoDashboard.tsx

import { useEffect, useRef, useState } from "react";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useCatalogStore } from "src/core/stores/useAICatalogStore";
import { DashboardSidebar } from "src/pages/Upload/components/DashboardSidebar";
import { DashboardHeader } from "src/pages/Upload/components/DashboardHeader";
import { DashboardProgressBar } from "src/pages/Upload/components/DashboardProgressBar";
import { StatsPanel } from "src/pages/Upload/components/StatsPanel";
import { NewVideoPanel } from "src/pages/Upload/components/NewVideoPanel";
import { ProcessingQueuePanel } from "src/pages/Upload/components/ProcessingQueuePanel";

export default function VideoDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const initializedRef = useRef(false);

    const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
    const refresh = useProcessingStore((state) => state.refresh);
    const stats = useProcessingStore((state) => state.stats);

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }
        initializedRef.current = true;
        void Promise.all([fetchCatalog(), refresh()]);
    }, [fetchCatalog, refresh]);

    return (
        <div className="relative flex min-h-[calc(100vh-6rem)] w-full">
            <DashboardSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            <DashboardProgressBar />

            <main className="flex flex-1 flex-col gap-10 px-8 py-10 lg:px-12">
                <StatsPanel
                total={stats.total}
                processing={stats.processing}
                processed={stats.processed}
                errors={stats.errors}
                />

                <div className="grid gap-10 xl:grid-cols-2">
                <NewVideoPanel />
                <ProcessingQueuePanel />
                </div>
            </main>
            </div>
        </div>
    );
}