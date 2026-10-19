// src/pages/Video/stores/useTranscriptionStore.ts

import { create } from "zustand";
import { VideoService } from "src/core/services/videoService";
import { getApiErrorMessage } from "src/core/utils/videoHelpers";
import { useVideoDetailStore } from "src/pages/Video/stores/useVideoDetailStore";
import type { VideoRecord, VideoTranscriptionResponse } from "src/core/types/videoTypes";
import { toast } from "sonner";
import i18n from "src/i18n";

interface TranscriptionState {
  transcription: VideoTranscriptionResponse | null;
  transcriptionDraft: string;
  transcriptionMessage: string;
  selectedLanguage: string;
  selectedModel: string;
  selectedVariant: string;
  transcriptionSegments: VideoTranscriptionResponse["transcription"]["segments"];
  isGenerating: boolean;
  isTranslating: boolean;

  setTranscriptionDraft: (draft: string) => void;
  setTranscriptionSegments: (segments: VideoTranscriptionResponse["transcription"]["segments"]) => void;
  setLanguage: (lang: string) => void;
  setModel: (model: string) => void;
  setSelectedVariant: (variant: string) => void;
  translateTranscription: (targetLanguage: string) => Promise<void>;

  fetchTranscription: (video: VideoRecord, variant?: string) => Promise<void>;
  resetTranscription: () => void;
  onSaveTranscription: () => Promise<void>;
  onDeleteTranscription: () => Promise<void>;
  onGenerateTranscription: () => Promise<void>;
}

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  transcription: null,
  transcriptionDraft: "",
  transcriptionMessage: "",
  selectedLanguage: "pt",
  selectedModel: "base",
  selectedVariant: "default",
  transcriptionSegments: [],
  isGenerating: false,
  isTranslating: false,

  setTranscriptionDraft: (transcriptionDraft) => set({ transcriptionDraft }),
  setTranscriptionSegments: (transcriptionSegments) => set({ transcriptionSegments }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  setModel: (selectedModel) => set({ selectedModel }),
  setSelectedVariant: (selectedVariant) => {
    const video = useVideoDetailStore.getState().video;
    set({ selectedVariant });
    if (video) void get().fetchTranscription(video, selectedVariant);
  },
  translateTranscription: async (targetLanguage) => {
    const video = useVideoDetailStore.getState().video;
    if (!video) return;
    try {
      set({ isTranslating: true });
      await VideoService.translateTranscription(video.id, get().selectedVariant, targetLanguage);
      toast.success(i18n.t("translationCreated"));
      await get().fetchTranscription(video, `${targetLanguage}-from-${get().selectedVariant}`);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, i18n.t("translationError")));
    } finally {
      set({ isTranslating: false });
    }
  },

  fetchTranscription: async (video, variant = get().selectedVariant) => {
    try {
      const { data, status } = await VideoService.getTranscription(video.transcription_url, variant);

      set({
        transcription: data,
        transcriptionDraft: data.transcription.content ?? "",
        transcriptionSegments: data.transcription.segments ?? [],
        selectedVariant: data.selected_variant ?? variant,
      });

      if (status === 200) {
        const hasTranscriptionContent = Boolean(
          data.transcription.content?.trim() || data.transcription.segments?.length
        );
        set({
          transcriptionMessage:
            data.available === false || data.transcription.status === "unavailable" || !hasTranscriptionContent
              ? data.transcription.error ?? "Não há uma transcrição disponível para este vídeo. Gere-a e depois confira-a neste editor."
              : `Transcrição carregada de ${data.storage.transcription_relative_path}.`,
        });
        return;
      }

      if (status === 202) {
        set({ transcriptionMessage: data.transcription.error ?? "A transcrição ainda está em processamento." });
        return;
      }

      set({ transcriptionMessage: data.transcription.error ?? "Ainda não existe transcrição salva." });
    } catch (error) {
      console.error(error);
      set({ transcriptionMessage: "Não foi possível carregar a transcrição." });
    }
  },


  resetTranscription: () => {
    set({ transcription: null, transcriptionDraft: "", transcriptionSegments: [], selectedVariant: "default" });
  },

  onSaveTranscription: async () => {
    const selectedVideo = useVideoDetailStore.getState().video;
    if (!selectedVideo) return;

    const { transcriptionDraft, fetchTranscription } = get();

    try {
      const segments = get().transcriptionSegments;
      const content = segments.length > 0
        ? segments.map((segment) => segment.text.trim()).filter(Boolean).join(" ")
        : transcriptionDraft;
      await VideoService.saveTranscription(
        selectedVideo.id,
        content,
        segments,
        get().selectedVariant,
      );
      toast.success(i18n.t("transcriptionSaved"));
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
      await fetchTranscription(selectedVideo);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, i18n.t("transcriptionSaveError")));
    }
  },

  onDeleteTranscription: async () => {
    const selectedVideo = useVideoDetailStore.getState().video;
    if (!selectedVideo) return;


    try {
      await VideoService.deleteTranscription(selectedVideo.id, get().selectedVariant);
      set({
        transcription: null,
        transcriptionDraft: "",
        transcriptionMessage: "Não há uma transcrição disponível para este vídeo. Gere-a e depois confira-a neste editor.",
        transcriptionSegments: [],
      });
      toast.success(i18n.t("transcriptionDeleted"));
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, i18n.t("transcriptionDeleteError")));
    }
  },

  onGenerateTranscription: async () => {
    const selectedVideo = useVideoDetailStore.getState().video;
    if (!selectedVideo) return;

    const { fetchTranscription } = get();
    const toastId = "transcription-generation";

    try {
      toast(i18n.t("generatingTranscriptionNotice"), { id: toastId });
      const { selectedLanguage, selectedModel } = get();
      set({ isGenerating: true });
      await VideoService.generateTranscription(selectedVideo.id, {
        language: selectedLanguage,
        modelName: selectedModel,
      });
      toast.success(i18n.t("transcriptionGenerated"), { id: toastId });
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
      await fetchTranscription(selectedVideo, `${selectedLanguage || "auto"}-${selectedModel}`);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, i18n.t("transcriptionGenerateError")), { id: toastId });
    } finally {
      set({ isGenerating: false });
    }
  },
}));
