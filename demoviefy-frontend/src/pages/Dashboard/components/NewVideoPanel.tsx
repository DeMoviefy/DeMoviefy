// src/pages/Dashboard/components/NewVideoPanel.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";

import { VideoAnalysisConfig } from "src/core/components/VideoAnalysisConfig";
import { useCatalogStore } from "src/core/stores/useAICatalogStore";
import { useProcessingStore } from "src/core/stores/useProcessingStore";
import { useUploadStore } from "src/core/stores/useUploadStore";
import { useUpload } from "src/pages/Dashboard/hooks/useUpload";

export function NewVideoPanel() {
    const { t } = useTranslation();
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
        uploadClipStart,
        setUploadClipStart,
        uploadClipEnd,
        setUploadClipEnd,
        uploadFrameStride,
        setUploadFrameStride,
        handleUpload,
    } = useUpload();

    const uploading = useUploadStore((state) => state.uploading);
    const isGuest = useProcessingStore((state) => state.isGuest);
    const guestVideoCount = useProcessingStore((state) => state.guestVideoCount);
    const guestVideoLimit = useProcessingStore((state) => state.guestVideoLimit);
    const guestLimitReached = isGuest === true && guestVideoCount >= guestVideoLimit;

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
                <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t("newVideo")}
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {t("newVideoDescription")}
                </p>
            </div>

            {isGuest && (
                <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
                    {t("guestUploadNotice", { limit: guestVideoLimit, count: guestVideoCount })} {t("guestSaveNotice")} {" "}
                    <Link className="font-semibold underline" to="/login">{t("login")}</Link>
                    {" "}·{" "}
                    <Link className="font-semibold underline" to="/cadastro">{t("createAccount")}</Link>
                </p>
            )}

            {guestLimitReached ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {t("guestLimitTitle", { limit: guestVideoLimit })}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                        {t("signInToContinue")}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                        <Link to="/login" className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500">
                            {t("login")}
                        </Link>
                        <Link to="/cadastro" className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-white dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900">
                            {t("createAccount")}
                        </Link>
                    </div>
                </div>
            ) : (
            <div
                className={`flex min-h-48 cursor-pointer items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${isDragging
                    ? " bg-blue-100  dark:bg-blue-950"
                    : "border-neutral-200 bg-neutral-50  hover:bg-zinc-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
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
                aria-label={t("dragSelectVideo")}
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
                        <span className="max-w-full break-all text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {file.name}
                        </span>

                        <span className="text-sm text-blue-700 dark:text-blue-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {t("addVideo")}
                        </p>

                        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            {t("dropVideo")}
                        </p>
                        <FaUpload
                            aria-hidden="true"
                            className="mt-4 size-7 text-neutral-400 dark:text-neutral-500"
                        />
                    </div>
                )}
            </div>
            )}

            {file && !guestLimitReached && (
                <div className="rounded-lg border border-neutral-200 bg-white px-3 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <VideoAnalysisConfig
                        taskType={uploadTask}
                        modelPath={uploadModelPath}
                        clipStart={uploadClipStart}
                        clipEnd={uploadClipEnd}
                        videoSource={file}
                        frameStride={uploadFrameStride}
                        tasks={tasks}
                        models={models}
                        onTaskChange={handleUploadTaskChange}
                        onModelChange={setUploadModelPath}
                        onClipStartChange={setUploadClipStart}
                        onClipEndChange={setUploadClipEnd}
                        onFrameStrideChange={setUploadFrameStride}
                    />

                    <div className="mt-8 flex items-center justify-end gap-8">
                        {/* Cancelar envio */}
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
                            className="cursor-pointer text-sm font-medium text-neutral-500 transition-colors hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
                        >
                            {t("cancelUpload")}
                        </button>

                        {/* Enviar vídeo */}
                        <button
                            type="button"
                            onClick={() => {
                                handleUpload(uploadTask, uploadModelPath);
                            }}
                            disabled={uploading}
                            className="cursor-pointer rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700 dark:focus-visible:ring-offset-neutral-900"
                        >
                            {t("upload")}
                        </button>
                    </div>
                </div>
            )}
        </section >
    );
}
