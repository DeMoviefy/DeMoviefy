// src/pages/Dashboard/hooks/useUpload.ts
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { VideoUploadService } from "src/pages/Dashboard/services/videoUploadService";
import { getApiErrorMessage } from "src/core/utils/videoHelpers";
import { useUploadStore } from "src/core/stores/useUploadStore";
import { useProcessingStore } from "src/core/stores/useProcessingStore";

export function useUpload() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploadClipStart, setUploadClipStart] = useState("0");
  const [uploadClipEnd, setUploadClipEnd] = useState("");

  const setUploading = useUploadStore((state) => state.setUploading);

  const handleUpload = useCallback(async (uploadTask: string, uploadModelPath: string) => {
    if (!file) {
      toast(t("uploadFileRequired"));
      return;
    }

    setUploading(true);
    try {
        toast(t("uploadStarted"), { id: "video-upload" });
      await VideoUploadService.uploadVideo(
        file,
        uploadTask,
        uploadModelPath,
        8,
        0.35,
        90000,
        parseInt(uploadClipStart) || 0,
        uploadClipEnd.trim() ? parseInt(uploadClipEnd) : null
      );

      setFile(null);
      setUploadClipStart("0");
      setUploadClipEnd("");

      await useProcessingStore.getState().refresh()
      
      toast.success(t("uploadSuccess"), { id: "video-upload" });

    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, t("uploadError")), { id: "video-upload" });
    } finally {
      setUploading(false);
    }
  }, [file, uploadClipStart, uploadClipEnd, setUploading, t]);

  return {
    file, setFile, uploadClipStart, setUploadClipStart,
    uploadClipEnd, setUploadClipEnd, handleUpload
  };
}
