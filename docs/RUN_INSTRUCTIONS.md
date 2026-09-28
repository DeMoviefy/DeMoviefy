# DeMoviefy - Run Instructions

## Início rápido

Na raiz do repositório, inicie o launcher:

```sh
python setup/main.py
```

Se o comando do Python for `python3`, use `python3 setup/main.py`. Responda `Y`
ao prompt inicial para aplicar o proxy da escola. Na janela, use **Setup
Environment** na primeira execução e **Start All** para iniciar os serviços.

Consulte o [Guia do Launcher](LAUNCHER.md) para ver o passo a passo de todas as
funcionalidades, requisitos e soluções de problemas.

## Fluxo de upload

1. Envie o video pela interface.
2. O backend salva o arquivo em `uploads/`.
3. A thread de processamento executa a análise com YOLO.
4. O resumo final vai para `uploads/analysis/video_<id>.json`.
5. O preview anotado vai para `uploads/annotated/video_<id>.mp4`.
6. A pagina mostra preview original, preview anotado, status e caminhos dos artefatos.

## Execução manual

### Python

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
```

### Backend

```powershell
cd demoviefy-backend
python run.py
```

Backend padrao:

- `http://127.0.0.1:5000`

### Frontend

```powershell
cd demoviefy-frontend
npm install
npm run dev
```

Frontend padrao:

- `http://localhost:5173`

## Variaveis uteis

- `PROXY_URL`: proxy HTTP/HTTPS para pip, npm e subprocessos do launcher
- `FRAME_AI_MODEL`: caminho alternativo para o modelo YOLO
- `FRAME_AI_FRAME_STRIDE`: intervalo de frames amostrados
- `FRAME_AI_CONFIDENCE`: confianca minima da detecção
- `FRAME_AI_MAX_FRAMES`: limite de frames processados

## Transcrição automática

O sistema agora tenta gerar transcrição automática com timestamps apos o processamento do video e tambem oferece um botao manual na interface.

O launcher tenta preparar automaticamente uma `.venv-transcription` com Python 3.11 ou 3.12. Se quiser fazer manualmente:

```powershell
py -3.12 -m venv .venv-transcription
.\.venv-transcription\Scripts\python -m pip install --upgrade pip
.\.venv-transcription\Scripts\python -m pip install -r demoviefy-backend/requirements-transcription.txt
```

No Linux, troque `.\.venv-transcription\Scripts\python` por `.venv-transcription/bin/python`.

Sem o Whisper instalado, o restante da análise continua funcionando normalmente. A tela vai mostrar o status da transcrição e ainda permitira edição manual.

## Troubleshooting

- Se a `.venv` estiver quebrada, o launcher recria durante `Setup Environment`.
- Se a transcrição automática não aparecer, confira se a `.venv-transcription` foi criada com Python 3.11/3.12.
- Se algum upload parecer "sumido", abra o painel do video na interface: o caminho do arquivo e do JSON aparecem ali.
- Se `npm` ou `pip` precisarem do proxy da escola, use `--proxy http://proxy.spo.ifsp.edu.br:3128`.
