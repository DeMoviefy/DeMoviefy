// src/pages/Video/stores/useAnalysisStore.ts

import { create } from "zustand";
import { VideoService } from "src/core/services/videoService";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { prettifyJson, getApiErrorMessage, buildArtifactSignature } from "src/core/utils/videoHelpers";
import { toast } from "sonner";
import { useTranscriptionStore } from "src/pages/Video/stores/useTranscriptionStore";
import { useVideoDetailStore } from "src/pages/Video/stores/useVideoDetailStore";
import { normalizeVideoRecord } from "src/core/utils/videoNormalizers";
import type { VideoAnalysisResponse, VideoRecord } from "src/core/types/videoTypes";

type AnalysisStatus = "idle" | "loading" | "ready" | "pending" | "error";

interface AnalysisState {
  analysis: VideoAnalysisResponse | null;
  analysisState: AnalysisStatus;
  analysisMessage: string;
  selectedAnalysisVariantId: string | null;
  analysisDraft: string;

  setAnalysisDraft: (draft: string) => void;
  setSelectedAnalysisVariantId: (id: string | null, video: VideoRecord) => void;

  // Substitui o useEffect de useAnalysis.ts: chamada explícita sempre que
  // selectedVideo ou selectedAnalysisVariantId mudam.
  syncAnalysisWithSelectedVideo: (video: VideoRecord | null) => Promise<void>;

  onDeleteAnalysis: (video: VideoRecord) => Promise<void>;
  onDeleteVideo: (video: VideoRecord) => Promise<boolean>;

  resetArtifactSignature: () => void;
}

// Variável de módulo: substitui o lastArtifactSignatureRef do hook original.
// Não é state porque não deve disparar re-render nem aparecer no devtools como dado de UI —
// é puramente um mecanismo de controle para não refazer fetch duplicado.
let lastArtifactSignature = "";

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  analysis: null,
  analysisState: "idle",
  analysisMessage: "",
  selectedAnalysisVariantId: null,
  analysisDraft: "{}",

  setAnalysisDraft: (analysisDraft) => set({ analysisDraft }),

  setSelectedAnalysisVariantId: (id, video) => {
    set({ selectedAnalysisVariantId: id });
    // No hook original, mudar o variant disparava o useEffect de novo (estava nas deps).
    // Aqui replicamos isso chamando o sync manualmente após trocar o id.
    void get().syncAnalysisWithSelectedVideo(video);
  },

  syncAnalysisWithSelectedVideo: async (selectedVideo) => {
    const { selectedAnalysisVariantId } = get();

    if (!selectedVideo) {
      set({
        analysis: null,
        selectedAnalysisVariantId: null,
        analysisState: "idle",
        analysisDraft: "{}",
      });
      lastArtifactSignature = "";
      return;
    }

    const currentSignature = buildArtifactSignature(selectedVideo, selectedAnalysisVariantId);
    if (lastArtifactSignature === currentSignature) return;
    lastArtifactSignature = currentSignature;

    set({ analysisState: "loading" });

    try {
      const { data: normalizedVideoAnalysis, status } = await VideoService.getNormalizedVideoAnalysis(
        selectedVideo.analysis_url,
        selectedAnalysisVariantId
      );

      set({ analysis: normalizedVideoAnalysis });

      if (
        normalizedVideoAnalysis?.selected_variant_id &&
        normalizedVideoAnalysis.selected_variant_id !== selectedAnalysisVariantId
      ) {
        set({ selectedAnalysisVariantId: normalizedVideoAnalysis.selected_variant_id });
      }

      set({
        analysisDraft: prettifyJson(normalizedVideoAnalysis?.analysis ?? {}),
        analysisState: status === 200 ? "ready" : status === 202 ? "pending" : "error",
      });
    } catch (error) {
      console.error(error);
      set({ analysis: null, analysisDraft: "{}", analysisState: "error" });
    }

    await useTranscriptionStore.getState().fetchTranscription(selectedVideo);
  },

  onDeleteAnalysis: async (selectedVideo) => {

    const { selectedAnalysisVariantId } = get();

    try {
      await VideoService.deleteAnalysis(selectedVideo.id, selectedAnalysisVariantId);

      try {
        const updatedVideo = normalizeVideoRecord(await VideoService.getVideoById(selectedVideo.id));
        useVideoDetailStore.setState({ video: updatedVideo });
        useProcessingStore.setState((state) => {
          const videos = state.videos.map((video) =>
            video.id === updatedVideo.id ? updatedVideo : video
          );
          return {
            videos,
            stats: {
              total: videos.length,
              processing: videos.filter((video) => video.status.startsWith("PROCESSANDO")).length,
              processed: videos.filter((video) => video.status === "PROCESSADO").length,
              errors: videos.filter((video) => video.status.startsWith("ERRO")).length,
            },
          };
        });
      } catch (refreshError) {
        console.error("Não foi possível atualizar o status do vídeo após excluir a análise.", refreshError);
      }

      set({
        analysis: null,
        selectedAnalysisVariantId: null,
        analysisDraft: "{}",
        analysisState: "idle",
      });
        get().resetArtifactSignature();
        void get().syncAnalysisWithSelectedVideo(selectedVideo);

      toast.success("Análise excluída.");


    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível excluir a análise."));
    }
  },

  onDeleteVideo: async (selectedVideo) => {

    try {
      await VideoService.deleteVideo(selectedVideo.id);
      toast.success("Vídeo removido com sucesso.");

      set({ analysis: null, analysisDraft: "{}" });
      useTranscriptionStore.getState().resetTranscription();

      get().resetArtifactSignature();
      return true;
      
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o vídeo."));
      return false;
    }
  },

  resetArtifactSignature: () => {
    lastArtifactSignature = "";
  },
}));
