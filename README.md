<p align="center"> <img src="DeMoviefy-Light.png" alt="demoviefy logo" width="300"> </p>

![License](https://img.shields.io/badge/license-MIT-green)

O DeMoviefy é uma plataforma automatizada e gratuita para análise, processamento e revisão de arquivos digitais de vídeo. O projeto foi desenvolvido para otimizar o fluxo de moderação de conteúdo em larga escala, integrando inteligência artificial e visão computacional de forma simples, acessível e sem burocracia.

O que é o projeto e suas funcionalidades
O DeMoviefy combina tecnologias avançadas de processamento de dados para extrair informações úteis de vídeos automaticamente. Suas principais funcionalidades incluem:

Upload e gerenciamento de vídeos: envio simplificado de arquivos de vídeo compatíveis através de uma interface intuitiva.
Análise por inteligência artificial (YOLO): processamento visual para detectar objetos, identificar conteúdos sensíveis (como violência ou linguagem imprópria) e categorizar o material.
Transcrição automática de áudio: extração e conversão do áudio do vídeo em texto estruturado com marcações de tempo (timestamps).
Tradução local de legendas: suporte à tradução de legendas utilizando ferramentas locais (Argos Translate) para diferentes idiomas.
Estimativa de classificação indicativa: sugestão automática de faixa etária e classificação com base nas normas do ministério da justiça e segurança pública (MJSP).
Navegação por timestamps: reprodutor interativo que permite saltar diretamente para os momentos marcados como importantes pela análise de IA.
Estrutura
demoviefy-backend/: API Flask, persistência e processamento
demoviefy-frontend/: interface React para upload, biblioteca e visualização da análise
ai_model/: modelo YOLO, app de teste e utilitários de IA
docs/: instruções complementares
uploads/: vídeos enviados e arquivos de análise gerados em tempo de execução
setup/main.py: launcher multiplataforma, capaz de criar ou reparar a .venv
Onde os arquivos ficam
Vídeo enviado: uploads/<nome-do-arquivo>
Resumo da análise: uploads/analysis/video_<id>.json
Banco SQLite local: demoviefy-backend/instance/demoviefy.db
O frontend agora mostra esses caminhos diretamente no painel de detalhes, junto com o preview do vídeo e o status do processamento.

Quick Start
Com o Launcher (Recomendado)
Abra o PowerShell na pasta raiz do repositório (demoviefy-demoviefy/).

python setup/main.py
No início, responda Y à pergunta sobre o proxy da escola se quiser usá-lo (Aperte N caso não tenha proxy). Na janela, clique em Setup Environment na primeira execução e depois em Start All. Consulte o [Guia do Launcher](docs/LAUNCHER.md) para conhecer todas as opções, incluindo iniciar cada serviço separadamente.

Execução Manual
Passo 1 - Setup Python:

Abra o terminal na pasta raiz do projeto e execute os comandos para criar o ambiente Python e instalar as dependências da API:

Windows:

python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
Linux:

python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
(Opcional para suporte completo a transcrição offline via Whisper, instale também as dependências de IA/Transcrição recomendadas):

pip install -r demoviefy-backend/ai-requirements.txt
Passo 2 - Backend:

Em um terminal com o ambiente virtual ativado, navegue até a pasta do backend e execute o servidor:

cd demoviefy-backend
python run.py
Acesse: http://127.0.0.1:5000

Passo 3 - Frontend (em outro terminal):

Abra uma nova janela do terminal na raiz do projeto, acesse a pasta do frontend, instale as dependências de pacotes do Node e inicie o ambiente de desenvolvimento:

cd demoviefy-frontend
npm install
npm run dev
Acesse: http://localhost:5173

Fluxo de Upload
Envie o vídeo pela interface
Backend salva em uploads/
Thread de processamento executa análise com YOLO
Resumo final vai para uploads/analysis/video_<id>.json
Preview anotado vai para uploads/annotated/video_<id>.mp4
Interface mostra preview, status e caminhos dos artefatos
Configurações
PROXY_URL: proxy HTTP/HTTPS para pip, npm e subprocessos
FRAME_AI_MODEL: caminho alternativo para modelo YOLO
FRAME_AI_FRAME_STRIDE: intervalo de frames amostrados
FRAME_AI_CONFIDENCE: confianca minima da detecção
FRAME_AI_MAX_FRAMES: limite de frames processados
Transcrição Automática
O sistema gera transcrição automática com timestamps apos processamento. Recomendado:

.\.venv\Scripts\python -m pip install -r demoviefy-backend/requirements-transcription.txt
Na tela do vídeo, use Gerar transcrição por IA para escolher o idioma e o nível de precisão do Whisper. A transcrição automática fica habilitada por padrão; para desabilitá-la explicitamente, defina AUTO_TRANSCRIPTION_ENABLED=false.

O fluxo correto é:

Gere a transcrição no idioma original do áudio.
Clique em Traduzir, escolha outro idioma e aguarde a nova versão aparecer no seletor Versão.
Se o idioma de origem e o destino forem iguais, a tradução fica bloqueada e nenhuma chamada de tradução é feita.
Clique no timestamp azul de um segmento para levar o vídeo àquele momento.
Use Editar transcrição para alterar texto, início e fim dos segmentos, e depois clique em Salvar transcrição.
A tradução nunca é executada automaticamente durante a geração da transcrição. A tradução usa Argos Translate localmente, com suporte a português (pt), inglês (en) e espanhol (es). O setup instala os modelos en → pt, pt → en, en → es e es → en. Português e espanhol podem usar inglês como intermediário, com possível perda de qualidade.

Execute Setup Environment no launcher para preparar os modelos. Para atualizar somente a tradução, execute na raiz do projeto (PowerShell):

.venv/Scripts/python.exe -m pip install argostranslate==1.11.0
.venv/Scripts/python.exe demoviefy-backend/scripts/install_translation_models.py
O download inicial precisa de internet e respeita o proxy configurado no launcher. O script reutiliza modelos existentes e valida as seis direções de tradução. Depois do setup, reinicie o backend. A tradução roda na CPU por padrão, sem chamadas ao Google, chave de API ou limites externos de requisições. Os modelos ficam em uploads/argos/packages; ARGOS_PACKAGES_DIR permite mudar esse caminho (use o mesmo valor no setup e no backend).

Cada segmento concluído é salvo em uploads/translation_cache.sqlite3. TRANSLATION_CACHE_PATH permite mudar o caminho. O cache inclui idiomas, texto, versão do Argos e versões dos modelos. Resultados antigos do Google são preservados em sua tabela original e não são reutilizados pelo Argos. O cache contém texto e tradução e não é removido ao excluir um vídeo. As variáveis antigas TRANSLATION_REQUEST_INTERVAL e TRANSLATION_MAX_RETRIES não são mais utilizadas, pois a inferência é local.

A origem deve ter um idioma definido; não há detecção automática no tradutor. Modelos ausentes e idiomas não suportados geram mensagens específicas. A versão original e os timestamps são preservados. A tradução continua síncrona e vídeos longos podem atingir o timeout HTTP; uma nova tentativa aproveita o cache.

Importante: Manter torch==2.11.0 e torchvision==0.26.0 para compatibilidade.

Documentação Adicional
[Guia do Launcher](docs/LAUNCHER.md) - Como iniciar o launcher e usar todas as suas funcionalidades
[Organização de Código](CODE_ORGANIZATION_GUIDE.md) - Arquitetura MVC do backend e frontend
[Guia de Contribuição](CONTRIBUTING.md) - Como contribuir com o projeto
[IA & Frame Processing](docs/FRAME_AI.md) - Detalhes do pipeline de IA
[Treinamento de Modelos](docs/TRAINING_MODELS.md) - Como treinar novos modelos YOLO
O launcher pode ser iniciado com o Python do sistema, mesmo sem .venv. Ao clicar em Setup Environment, ele cria ou repara o ambiente automaticamente.

Execução manual
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r demoviefy-backend/requirements.txt
Frontend:

cd demoviefy-frontend
npm install
npm run dev
Backend:

cd demoviefy-backend
python run.py
Organização interna
Backend Flask:

demoviefy-backend/app/controllers/: entrada HTTP
demoviefy-backend/app/services/: regras de negocio e IA
demoviefy-backend/app/repositories/: acesso a dados
demoviefy-backend/app/config/: configuracoes e paths compartilhados
Frontend React:

demoviefy-frontend/src/features/videos/: fluxo principal de upload e inspeção
demoviefy-frontend/src/components/: cabecalho e rodape
demoviefy-frontend/src/layouts/: estrutura visual da aplicação
demoviefy-frontend/src/services/: cliente HTTP
Observações
O backend usa ai_model/model/yolo26l.pt automaticamente quando esse arquivo existe.
A transcrição automática com timestamps usa Whisper quando instalado; prefira Python 3.11/3.12 para esse recurso.
Para evitar conflitos de dependencias, o demoviefy-backend/requirements-transcription.txt usa torch==2.11.0 e o launcher faz um ajustamento de torchvision quando necessario.
Se o launcher for iniciado dentro de um debugger, ele remove variaveis de debug dos subprocessos para evitar o erro de __firstlineno__ no SQLAlchemy.
docs/RUN_INSTRUCTIONS.md, docs/FRAME_AI.md e docs/TRAINING_MODELS.md continuam como referencia de execução e da pipeline de IA.
