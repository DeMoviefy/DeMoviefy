# DeMoviefy

![License](https://img.shields.io/badge/license-MIT-green)

Monorepo para upload, análise e acompanhamento de videos com backend Flask, frontend React e pipeline YOLO.

## Estrutura

- `demoviefy-backend/`: API Flask, persistencia e processamento
- `demoviefy-frontend/`: interface React para upload, biblioteca e visualização da análise
- `ai_model/`: modelo YOLO, app de teste e utilitarios de IA
- `docs/`: instrucoes complementares
- `uploads/`: videos enviados e arquivos de análise gerados em tempo de execução
- `setup/main.py`: launcher multiplataforma, capaz de criar ou reparar a `.venv`

## Onde os arquivos ficam

- Video enviado: `uploads/<nome-do-arquivo>`
- Resumo da análise: `uploads/analysis/video_<id>.json`
- Banco SQLite local: `demoviefy-backend/instance/demoviefy.db`

O frontend agora mostra esses caminhos diretamente no painel de detalhes, junto com o preview do video e o status do processamento.

## Quick Start

### Com o Launcher (Recomendado)

```powershell
python setup/main.py
```

No início, responda `Y` à pergunta sobre o proxy da escola se quiser usá-lo.
Na janela, clique em `Setup Environment` na primeira execução e depois em
`Start All`. Consulte o [Guia do Launcher](docs/LAUNCHER.md) para conhecer todas
as opções, incluindo iniciar cada serviço separadamente.

### Execução Manual

**Setup Python:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
```

**Backend:**

```powershell
cd demoviefy-backend
python run.py
```

Acesse: `http://127.0.0.1:5000`

**Frontend (em outro terminal):**

```sh
cd demoviefy-frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Fluxo de Upload

1. Envie o video pela interface
2. Backend salva em `uploads/`
3. Thread de processamento executa análise com YOLO
4. Resumo final vai para `uploads/analysis/video_<id>.json`
5. Preview anotado vai para `uploads/annotated/video_<id>.mp4`
6. Interface mostra preview, status e caminhos dos artefatos

## Configurações

- `PROXY_URL`: proxy HTTP/HTTPS para pip, npm e subprocessos
- `FRAME_AI_MODEL`: caminho alternativo para modelo YOLO
- `FRAME_AI_FRAME_STRIDE`: intervalo de frames amostrados
- `FRAME_AI_CONFIDENCE`: confianca minima da detecção
- `FRAME_AI_MAX_FRAMES`: limite de frames processados

## Transcrição Automática

O sistema gera transcrição automática com timestamps apos processamento. Recomendado:

```powershell
.\.venv\Scripts\python -m pip install -r demoviefy-backend/requirements-transcription.txt
```

Na tela do vídeo, use **Gerar transcrição por IA** para escolher o idioma e o nível
de precisão do Whisper. A transcrição automática fica habilitada por padrão; para
desabilitá-la explicitamente, defina `AUTO_TRANSCRIPTION_ENABLED=false`.

O fluxo correto é:

1. Gere a transcrição no idioma original do áudio.
2. Clique em **Traduzir**, escolha outro idioma e aguarde a nova versão aparecer
   no seletor **Versão**.
3. Se o idioma de origem e o destino forem iguais, a tradução fica bloqueada e
   nenhuma chamada de tradução é feita.
4. Clique no timestamp azul de um segmento para levar o vídeo àquele momento.
5. Use **Editar transcrição** para alterar texto, início e fim dos segmentos, e
   depois clique em **Salvar transcrição**.

A tradução nunca é executada automaticamente durante a geração da transcrição.
A tradução usa **Argos Translate localmente**, com suporte a português (`pt`),
inglês (`en`) e espanhol (`es`). O setup instala os modelos `en → pt`, `pt → en`,
`en → es` e `es → en`. Português e espanhol podem usar inglês como intermediário,
com possível perda de qualidade.

Execute **Setup Environment** no launcher para preparar os modelos. Para atualizar
somente a tradução, execute na raiz do projeto (PowerShell):

```powershell
.venv/Scripts/python.exe -m pip install argostranslate==1.11.0
.venv/Scripts/python.exe demoviefy-backend/scripts/install_translation_models.py
```

O download inicial precisa de internet e respeita o proxy configurado no launcher.
O script reutiliza modelos existentes e valida as seis direções de tradução.
Depois do setup, reinicie o backend. A tradução roda na CPU por padrão, sem
chamadas ao Google, chave de API ou limites externos de requisições.
Os modelos ficam em `uploads/argos/packages`; `ARGOS_PACKAGES_DIR` permite mudar
esse caminho (use o mesmo valor no setup e no backend).

Cada segmento concluído é salvo em `uploads/translation_cache.sqlite3`.
`TRANSLATION_CACHE_PATH` permite mudar o caminho. O cache inclui idiomas, texto,
versão do Argos e versões dos modelos. Resultados antigos do Google são
preservados em sua tabela original e não são reutilizados pelo Argos.
O cache contém texto e tradução e não é removido ao excluir um vídeo.
As variáveis antigas `TRANSLATION_REQUEST_INTERVAL` e `TRANSLATION_MAX_RETRIES`
não são mais utilizadas, pois a inferência é local.

A origem deve ter um idioma definido; não há detecção automática no tradutor.
Modelos ausentes e idiomas não suportados geram mensagens específicas. A versão
original e os timestamps são preservados. A tradução continua síncrona e vídeos
longos podem atingir o timeout HTTP; uma nova tentativa aproveita o cache.

> **Importante**: Manter `torch==2.11.0` e `torchvision==0.26.0` para compatibilidade.

## Documentação Adicional

- [Guia do Launcher](docs/LAUNCHER.md) - Como iniciar o launcher e usar todas as suas funcionalidades
- [Organização de Código](CODE_ORGANIZATION_GUIDE.md) - Arquitetura MVC do backend e frontend
- [Guia de Contribuição](CONTRIBUTING.md) - Como contribuir com o projeto
- [IA & Frame Processing](docs/FRAME_AI.md) - Detalhes do pipeline de IA
- [Treinamento de Modelos](docs/TRAINING_MODELS.md) - Como treinar novos modelos YOLO

O launcher pode ser iniciado com o Python do sistema, mesmo sem `.venv`. Ao clicar em `Setup Environment`, ele cria ou repara o ambiente automaticamente.

### Execução manual

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
```

Frontend:

```sh
cd demoviefy-frontend
npm install
npm run dev
```

Backend:

```powershell
cd demoviefy-backend
python run.py
```

## Organização interna

Backend Flask:

- `demoviefy-backend/app/controllers/`: entrada HTTP
- `demoviefy-backend/app/services/`: regras de negocio e IA
- `demoviefy-backend/app/repositories/`: acesso a dados
- `demoviefy-backend/app/config/`: configuracoes e paths compartilhados

Frontend React:

- `demoviefy-frontend/src/features/videos/`: fluxo principal de upload e inspeção
- `demoviefy-frontend/src/components/`: cabecalho e rodape
- `demoviefy-frontend/src/layouts/`: estrutura visual da aplicação
- `demoviefy-frontend/src/services/`: cliente HTTP

## Observacoes

- O backend usa `ai_model/model/yolo26l.pt` automaticamente quando esse arquivo existe.
- A transcrição automática com timestamps usa Whisper quando instalado; prefira Python 3.11/3.12 para esse recurso.
- Para evitar conflitos de dependencias, o `demoviefy-backend/requirements-transcription.txt` usa `torch==2.11.0` e o launcher faz um ajustamento de `torchvision` quando necessario.
- Se o launcher for iniciado dentro de um debugger, ele remove variaveis de debug dos subprocessos para evitar o erro de `__firstlineno__` no SQLAlchemy.
- `docs/RUN_INSTRUCTIONS.md`, `docs/FRAME_AI.md` e `docs/TRAINING_MODELS.md` continuam como referencia de execução e da pipeline de IA.
