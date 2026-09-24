// src/pages/Upload/components/TranscriptionEditor.tsx

import { ConfirmationDialog } from "src/core/components/ConfirmationDialog"
import { formatTimecode } from "src/pages/Upload/utils/helpers"
import { useState } from "react"

interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
}

interface TranscriptionEditorProps {
  transcriptionDraft: string
  transcriptionMessage: string
  segments: TranscriptionSegment[]
  isBusy: boolean
  onDraftChange: (value: string) => void
  onSave: () => void
  onDelete: () => void
  onGenerate: () => void
  onSeek: (seconds: number) => void
  selectedLanguage: string
  onLanguageChange: (lang: string) => void
  availableLanguages: string[]
  selectedModel: string
  onModelChange: (model: string) => void
  isGenerating: boolean
  variants: NonNullable<import("src/pages/Upload/types").VideoTranscriptionResponse["variants"]>
  selectedVariant: string
  onVariantChange: (variant: string) => void
  onSegmentChange: (id: number, field: "start" | "end" | "text", value: string) => void
  isTranslating: boolean
  onTranslate: (targetLanguage: string) => void
}

export function TranscriptionEditor({
  transcriptionDraft,
  transcriptionMessage,
  segments,
  isBusy,
  onDraftChange,
  onSave,
  onDelete,
  onGenerate,
  onSeek,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  selectedModel,
  onModelChange,
  isGenerating,
  variants,
  selectedVariant,
  onVariantChange,
  onSegmentChange,
  isTranslating,
  onTranslate,
}: TranscriptionEditorProps) {
  const [translationLanguage, setTranslationLanguage] = useState("en")
  const sourceLanguage = variants.find((variant) => variant.id === selectedVariant)?.language ?? selectedLanguage
  const [isEditing, setIsEditing] = useState(false)
  const languageOptions = Array.from(new Set(["auto", "pt", "en", "es", ...availableLanguages]))
  const modelOptions = [
    { value: "tiny", label: "Rápida (tiny)" },
    { value: "base", label: "Equilibrada (base)" },
    { value: "small", label: "Mais precisa (small)" },
    { value: "medium", label: "Alta precisão (medium)" },
    { value: "large", label: "Máxima precisão (large)" },
  ]

  return (
    <section className="editor-card">
      <div className="section-heading">
        <div className="heading-content">
          <div className="title-group">
            <span className="eyebrow">Transcrição</span>
            <h3>Texto editável</h3>
          </div>

          <div className="transcription-options">
            <label className="field-block">
              <span>Versão</span>
              <select value={selectedVariant} onChange={(e) => onVariantChange(e.target.value)}>
                {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
              </select>
            </label>
            <label className="field-block">
              <span>Idioma</span>
              <select
                value={selectedLanguage || "auto"}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="language-dropdown"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "auto" ? "Detectar automaticamente" : lang === "pt" ? "Português" : lang === "en" ? "English" : "Español"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-block">
              <span>Precisão</span>
              <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)}>
                {modelOptions.map((model) => (
                  <option key={model.value} value={model.value}>{model.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="action-row action-row-start">
        <button type="button" className="primary-button" onClick={onGenerate} disabled={isBusy || isGenerating}>
          {isGenerating ? "Gerando transcrição..." : "Gerar transcrição por IA"}
        </button>
        <select
          value={translationLanguage}
          onChange={(e) => setTranslationLanguage(e.target.value)}
          disabled={isBusy || isGenerating || isTranslating}
          aria-label="Idioma da tradução"
        >
          {["pt", "en", "es"].map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}
        </select>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onTranslate(translationLanguage)}
          disabled={isBusy || isGenerating || isTranslating || !sourceLanguage || sourceLanguage === translationLanguage}
          title={sourceLanguage === translationLanguage ? "A transcrição já está nesse idioma." : "Traduzir somente ao clicar"}
        >
          {isTranslating ? "Traduzindo..." : "Traduzir"}
        </button>
        {!isEditing && (
          <button
            type="button"
            className="ghost-button"
            onClick={() => setIsEditing(true)}
            disabled={isBusy || isGenerating}
          >
            Editar transcrição
          </button>
        )}
      </div>
      {isGenerating && (
        <div className="transcription-progress" role="status" aria-live="polite">
          <div className="processing-progress-header">
            <div className="progress-metrics">
              <strong>Processando</strong>
              <span>Transcrição</span>
            </div>
            <span className="progress-eta">Isso pode levar alguns minutos</span>
          </div>
          <div className="progress-bar transcription-progress-bar" aria-hidden="true">
            <span />
          </div>
          <small>O Whisper está extraindo o áudio e criando os timestamps. Não feche esta página.</small>
        </div>
      )}
      <textarea
        className={`editor-area transcription-area${isEditing ? "" : " transcription-readonly"}`}
        value={transcriptionDraft}
        onChange={(e) => onDraftChange(e.target.value)}
        readOnly={!isEditing}
        placeholder="Cole ou escreva aqui a transcrição do vídeo."
      />
      <p className="transcription-note">{transcriptionMessage}</p>
      {segments.length > 0 && (
        <div className="segment-list">
          {segments.map((segment) => (
            <div
              key={`${segment.id}-${segment.start}`}
              className="segment-item"
            >
              <button type="button" className="segment-time" onClick={() => onSeek(segment.start)} title="Ir para este momento do vídeo">
                {formatTimecode(segment.start)} - {formatTimecode(segment.end)}
              </button>
              {isEditing ? (
                <div className="segment-edit-row">
                  <input type="number" min="0" step="0.01" value={segment.start} onChange={(e) => onSegmentChange(segment.id, "start", e.target.value)} aria-label="Início do segmento" />
                  <input type="number" min="0" step="0.01" value={segment.end} onChange={(e) => onSegmentChange(segment.id, "end", e.target.value)} aria-label="Fim do segmento" />
                  <input type="text" value={segment.text} onChange={(e) => onSegmentChange(segment.id, "text", e.target.value)} aria-label="Texto do segmento" />
                </div>
              ) : (
                <span className="segment-text">{segment.text}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="action-row">
        <ConfirmationDialog
          title="Excluir transcrição"
          message="Tem certeza que deseja excluir esta transcrição? Essa ação não pode ser desfeita."
          onConfirm={onDelete}
        >
          {(open) => (
            <button type="button" className="ghost-button danger-button" onClick={open} disabled={isBusy}>
              Excluir transcrição
            </button>
          )}
        </ConfirmationDialog>

        {isEditing && (
          <>
            <button type="button" className="ghost-button" onClick={() => setIsEditing(false)} disabled={isBusy}>
              Sair do modo edição
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                onSave()
                setIsEditing(false)
              }}
              disabled={isBusy}
            >
              Salvar transcrição
            </button>
          </>
        )}
      </div>
    </section>
  )
}