// src/pages/Dashboard/hooks/useUpload.ts
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { VideoUploadService } from "src/pages/Dashboard/services/videoUploadService";
import { getApiErrorMessage } from "src/core/utils/videoHelpers";
import { useUploadStore } from "src/core/stores/useUploadStore";
import { useProcessingStore } from "src/core/stores/useProcessingStore";

export function useUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadClipStart, setUploadClipStart] = useState("0");
  const [uploadClipEnd, setUploadClipEnd] = useState("");

  const setUploading = useUploadStore((state) => state.setUploading);

  const handleUpload = useCallback(async (uploadTask: string, uploadModelPath: string) => {
    if (!file) {
      toast("Selecione um arquivo antes de enviar.");
      return;
    }

    setUploading(true);
    try {
        toast("Upload iniciado")
      const response = await VideoUploadService.uploadVideo(
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
      
      toast.success(response.message);

    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Erro no upload do video."));
    } finally {
      setUploading(false);
    }
  }, [file, uploadClipStart, uploadClipEnd, setUploading]);

  return {
    file, setFile, uploadClipStart, setUploadClipStart,
    uploadClipEnd, setUploadClipEnd, handleUpload
  };
}
