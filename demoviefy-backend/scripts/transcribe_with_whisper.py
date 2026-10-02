import argparse
import json
import sys
from pathlib import Path
import whisper


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TRANSCRIPTIONS_DIR = REPO_ROOT / "uploads" / "transcriptions"
UPLOADS_DIR = REPO_ROOT / "uploads" / "videos"

def run_transcription(video_id: str, model_name: str = "base"):
    print(f"[INFO] Iniciando transcrição para o video_id: {video_id}")
    

    TRANSCRIPTIONS_DIR.mkdir(parents=True, exist_ok=True)
    video_path = None
    

    for ext in [".mp4", ".mkv", ".avi", ".mov"]:
        possible_path = UPLOADS_DIR / f"{video_id}{ext}"
        if possible_path.exists():
            video_path = possible_path
            break
            
    if not video_path:
        print(f"[ERRO] Arquivo de vídeo para ID '{video_id}' não encontrado em {UPLOADS_DIR}", file=sys.stderr)
        sys.exit(1)

    print(f"[INFO] Vídeo encontrado: {video_path}")

    try:
        print(f"[INFO] Carregando modelo Whisper ('{model_name}')...")
        model = whisper.load_model(model_name)
    except Exception as e:
        print(f"[ERRO] Falha ao carregar o modelo Whisper: {e}", file=sys.stderr)
        sys.exit(1)


    try:
        print("[INFO] Transcrevendo áudio...")
        result = model.transcribe(str(video_path))
    except Exception as e:
        print(f"[ERRO] Falha durante a transcrição do áudio: {e}", file=sys.stderr)
        sys.exit(1)


    output_data = {
        "video_id": video_id,
        "text": result.get("text", "").strip(),
        "segments": [
            {
                "id": seg["id"],
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip()
            }
            for seg in result.get("segments", [])
        ]
    }

    output_file = TRANSCRIPTIONS_DIR / f"video_{video_id}.json"
    
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"[SUCESSO] Transcrição salva em: {output_file}")
    except Exception as e:
        print(f"[ERRO] Falha ao salvar arquivo JSON: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script de transcrição com OpenAI Whisper")
    parser.add_argument("--video_id", required=True, help="ID do vídeo a ser transcrito")
    parser.add_argument("--model", default="base", help="Modelo do Whisper (tiny, base, small, medium, large)")
    
    args = parser.parse_args()
    run_transcription(args.video_id, args.model)