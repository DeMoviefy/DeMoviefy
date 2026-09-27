// src/pages/Dashboard/components/NewVideoPanel.tsx

import { useCallback, useEffect, useRef, useState } from "react";

import { VideoAnalysisConfig } from "src/core/components/VideoAnalysisConfig";
import { useCatalogStore } from "src/core/stores/useAICatalogStore";
import { useUploadStore } from "src/core/stores/useUploadStore";
import { useUpload } from "src/pages/Dashboard/hooks/useUpload";

export function NewVideoPanel() {
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        tasks,
        models,
        uploadTask,
        uploadModelPath,
        handleUploadTaskChange,
        setUploadModelPath,
        fetchCatalog,
    } = useCatalogStore();

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    const {
        file,
        setFile,
        uploadFrameStride,
        setUploadFrameStride,
        uploadConfidenceThreshold,
        setUploadConfidenceThreshold,
        uploadMaxFrames,
        setUploadMaxFrames,
        uploadClipStart,
        setUploadClipStart,
        uploadClipEnd,
        setUploadClipEnd,
        handleUpload,
    } = useUpload();

    const uploading = useUploadStore((state) => state.uploading);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDragging(false);

            if (e.dataTransfer.files.length > 0) {
                setFile(e.dataTransfer.files[0]);
            }
        },
        [setFile]
    );

    const handleClick = () => fileInputRef.current?.click();

    const handleFileInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                    Novo vídeo
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-neutral-500">
                    Envie um vídeo e escolha como ele será analisado.
                </p>
            </div>

            <div
                className={`flex min-h-48 cursor-pointer items-center justify-center rounded-xl border px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isDragging
                    ? "border-blue-400 bg-blue-100"
                    : "border-neutral-300 bg-neutral-50 hover:border-blue-300 hover:bg-blue-100"
                    }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        handleClick();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label="Arrastar vídeo ou clicar para selecionar"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-hidden="true"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="max-w-full break-all text-sm font-medium text-neutral-900">
                            {file.name}
                        </span>

                        <span className="text-sm text-blue-700">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">
                            Arraste seu vídeo aqui
                        </p>

                        <p className="mt-1.5 text-sm text-neutral-500">
                            ou clique para selecionar um arquivo
                        </p>
                    </div>
                )}
            </div>

            {file && (
                <div className="flex flex-col gap-8">
                    <VideoAnalysisConfig
                        taskType={uploadTask}
                        modelPath={uploadModelPath}
                        frameStride={uploadFrameStride}
                        confidenceThreshold={uploadConfidenceThreshold}
                        maxFrames={uploadMaxFrames}
                        clipStart={uploadClipStart}
                        clipEnd={uploadClipEnd}
                        tasks={tasks}
                        models={models}
                        onTaskChange={handleUploadTaskChange}
                        onModelChange={setUploadModelPath}
                        onFrameStrideChange={setUploadFrameStride}
                        onConfidenceChange={setUploadConfidenceThreshold}
                        onMaxFramesChange={setUploadMaxFrames}
                        onClipStartChange={setUploadClipStart}
                        onClipEndChange={setUploadClipEnd}
                    />

                    {/* Enviar vídeo */}
                    <button
                        type="button"
                        onClick={() => {
                            handleUpload(uploadTask, uploadModelPath);
                        }}
                        disabled={uploading}
                        className="w-full cursor-pointer rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Enviar vídeo
                    </button>

                    {/* Remover vídeo */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);

                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                        className="cursor-pointer text-sm font-medium text-neutral-500 transition-colors hover:text-red-600"
                    >
                        Cancelar envio
                    </button>
                </div>
            )}
        </section >
    );
}
