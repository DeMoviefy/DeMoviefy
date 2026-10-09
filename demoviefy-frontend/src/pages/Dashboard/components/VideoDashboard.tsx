// src/pages/Dashboard/components/VideoDashboard.tsx

import { useEffect, useRef, useState } from "react";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useCatalogStore } from "src/core/stores/useAICatalogStore";
import { DashboardSidebar } from "src/pages/Dashboard/components/DashboardSidebar";
import { StatsPanel } from "src/pages/Dashboard/components/StatsPanel";
import { NewVideoPanel } from "src/pages/Dashboard/components/NewVideoPanel";
import { ProcessingQueuePanel } from "src/pages/Dashboard/components/ProcessingQueuePanel";

export default function VideoDashboard() {
    const initializedRef = useRef(false);
    const libraryStateInitializedRef = useRef(false);
    const previousVideoCountRef = useRef(0);
    const [isLibraryOpen, setIsLibraryOpen] = useState(
        () => useProcessingStore.getState().videos.length > 0,
    );

    const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
    const refresh = useProcessingStore((state) => state.refresh);
    const stats = useProcessingStore((state) => state.stats);
    const videoCount = useProcessingStore((state) => state.videos.length);
    const videosInitialized = useProcessingStore((state) => state.initialized);

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }
        initializedRef.current = true;
        void Promise.all([fetchCatalog(), refresh()]);
    }, [fetchCatalog, refresh]);

    useEffect(() => {
        if (!videosInitialized) return;

        if (!libraryStateInitializedRef.current) {
            libraryStateInitializedRef.current = true;
            previousVideoCountRef.current = videoCount;
            setIsLibraryOpen(videoCount > 0);
            return;
        }

        if (previousVideoCountRef.current === 0 && videoCount > 0) {
            setIsLibraryOpen(true);
        }

        previousVideoCountRef.current = videoCount;
    }, [videoCount, videosInitialized]);

    return (
        <div className="relative flex min-h-[calc(100vh-6rem)] w-full flex-col pt-4">
            <div className="flex min-h-0 flex-1">
                <DashboardSidebar
                    isOpen={isLibraryOpen}
                    onToggle={() => setIsLibraryOpen((open) => !open)}
                />

                <div className={`flex min-w-0 flex-1 flex-col gap-8 ${isLibraryOpen ? "pl-8" : "pl-4"}`}>
                    <StatsPanel
                        total={stats.total}
                        processing={stats.processing}
                        processed={stats.processed}
                        errors={stats.errors}
                    />

                    <div className="grid gap-8 xl:grid-cols-2">
                        <NewVideoPanel />
                        <ProcessingQueuePanel />
                    </div>
                </div>
            </div>
        </div>

    );
}
