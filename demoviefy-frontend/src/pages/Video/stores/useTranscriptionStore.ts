// src/pages/Video/stores/useTranscriptionStore.ts

import { create } from "zustand";
import { VideoService } from "src/pages/Upload/services/videoService";
import { getApiErrorMessage } from "src/pages/Upload/utils/helpers";
import { useVideoDetailStore } from "src/pages/Video/stores/useVideoDetailStore";
import type { VideoRecord, VideoTranscriptionResponse } from "src/pages/Upload/types";
import { toast } from "sonner";

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
  setLanguage: (lang: string) => void;
  setModel: (model: string) => void;
  setSelectedVariant: (variant: string) => void;
  updateSegment: (id: number, field: "start" | "end" | "text", value: string) => void;
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
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  setModel: (selectedModel) => set({ selectedModel }),
  setSelectedVariant: (selectedVariant) => {
    const video = useVideoDetailStore.getState().video;
    set({ selectedVariant });
    if (video) void get().fetchTranscription(video, selectedVariant);
  },
  updateSegment: (id, field, value) => set((state) => ({
    transcriptionSegments: state.transcriptionSegments.map((segment) =>
      segment.id === id
        ? { ...segment, [field]: field === "text" ? value : Number(value) }
        : segment
    ),
  })),
  translateTranscription: async (targetLanguage) => {
    const video = useVideoDetailStore.getState().video;
    if (!video) return;
    try {
      set({ isTranslating: true });
      await VideoService.translateTranscription(video.id, get().selectedVariant, targetLanguage);
      toast.success("Tradução gerada. Ela já está disponível na lista de versões.");
      await get().fetchTranscription(video, `${targetLanguage}-from-${get().selectedVariant}`);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível gerar a tradução."));
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
        set({
          transcriptionMessage:
            data.transcription.status === "unavailable"
              ? data.transcription.error ?? "A transcrição automática não está disponível."
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
      toast.success("Transcrição salva com sucesso.");
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
      await fetchTranscription(selectedVideo);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível salvar a transcrição."));
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
        transcriptionMessage: "Transcrição removida. Você pode criar uma nova quando quiser.",
        transcriptionSegments: [],
      });
      toast.success("Transcrição excluída.");
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível excluir a transcrição."));
    }
  },

  onGenerateTranscription: async () => {
    const selectedVideo = useVideoDetailStore.getState().video;
    if (!selectedVideo) return;

    const { fetchTranscription } = get();

    try {
      set({ transcriptionMessage: "Gerando transcrição automática. Isso pode levar alguns instantes." });
      const { selectedLanguage, selectedModel } = get();
      set({ isGenerating: true });
      const { message: apiMessage } = await VideoService.generateTranscription(selectedVideo.id, {
        language: selectedLanguage,
        modelName: selectedModel,
      });
      toast(apiMessage);
      await useVideoDetailStore.getState().fetchVideoById(selectedVideo.id);
      await fetchTranscription(selectedVideo, `${selectedLanguage || "auto"}-${selectedModel}`);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Não foi possível gerar a transcrição automática. Verifique o Whisper e o ffmpeg."));
    } finally {
      set({ isGenerating: false });
    }
  },
}));