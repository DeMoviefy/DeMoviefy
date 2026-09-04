// src/core/stores/useCatalogStore.ts
import { create } from "zustand";
import { VideoService } from "src/pages/Dashboard/services/videoService";
import type { AITaskOption, AIModelOption } from "src/pages/Dashboard/types";
import { chooseFirstModel, choosePreferredTask } from "src/pages/Dashboard/utils/helpers";

interface CatalogState {
  tasks: AITaskOption[];
  models: AIModelOption[];
  uploadTask: string;
  uploadModelPath: string;
  setUploadModelPath: (path: string) => void;
  fetchCatalog: () => Promise<void>;
  handleUploadTaskChange: (taskType: string) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  tasks: [],
  models: [],
  uploadTask: "",
  uploadModelPath: "",

  setUploadModelPath: (uploadModelPath) => set({ uploadModelPath }),

  fetchCatalog: async () => {
    try {
      const { tasks, models } = await VideoService.getModelCatalog();
      const defaultTask = choosePreferredTask(tasks);
      set({
        tasks,
        models,
        uploadTask: defaultTask,
        uploadModelPath: chooseFirstModel(models, defaultTask),
      });
    } catch (error) {
      console.error(error);
    }
  },

  handleUploadTaskChange: (taskType) => {
    const { models } = get();
    set({
      uploadTask: taskType,
      uploadModelPath: chooseFirstModel(models, taskType),
    });
  },
}));