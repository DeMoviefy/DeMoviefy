import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useVideoDetailStore } from "src/pages/Video/stores/useVideoDetailStore";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useVideoConfig } from "src/pages/Video/hooks/useVideoConfig";
import { useCatalogStore } from "src/core/stores/useAICatalogStore";
import { VideoWorkbench } from "src/pages/Video/components/VideoWorkbench";

export default function Video() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const parsedId = id ? Number(id) : NaN;
    const isValidId = !Number.isNaN(parsedId);

    useEffect(() => {
        const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
        if (!viewport) return;

        const previousContent = viewport.content;
        // Render the workbench at desktop width on phones; browsers scale it to
        // fit initially while retaining pinch-to-zoom for close work.
        viewport.content = "width=1280, user-scalable=yes";
        return () => {
            viewport.content = previousContent;
        };
    }, []);

    useEffect(() => {
        if (isValidId) {
            void useVideoDetailStore.getState().fetchVideoById(parsedId);
            void useProcessingStore.getState().refresh();
        }
        if (useCatalogStore.getState().tasks.length === 0) {
            void useCatalogStore.getState().fetchCatalog();
        }
    }, [parsedId, isValidId]);

    const video = useVideoDetailStore((state) => state.video);
    const selectedVideoIsBusy = video?.status.startsWith("PROCESSANDO") ?? false;
    const loading = useVideoDetailStore((state) => state.loading);
    const error = useVideoDetailStore((state) => state.error);
    const { videoConfig, setVideoConfig, handleReprocess } = useVideoConfig(video);

    if (!isValidId) return <p>{t("invalidVideoId")}</p>;
    if (loading && !video) return <p>{t("loadingVideo")}</p>;
    if (error) return <p>{error}</p>;

    return (
        <VideoWorkbench
            video={video}
            config={videoConfig}
            isBusy={selectedVideoIsBusy}
            onConfigChange={setVideoConfig}
            onReprocess={handleReprocess}
        />
    );
}
