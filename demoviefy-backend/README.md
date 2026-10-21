# DeMoviefy Backend

API Flask e serviços de processamento do DeMoviefy. Para iniciar manualmente,
execute os comandos a partir da raiz do repositório.

## Requisitos

- Python 3.11 ou 3.12 recomendado (especialmente para recursos de Whisper).
- pip disponível no Python.

## Instalação

Crie e prepare um ambiente virtual na raiz do repositório:

```sh
python -m venv .venv
```

Ative o ambiente e instale as dependências. No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r demoviefy-backend/requirements.txt
```

No Linux ou macOS:

```sh
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r demoviefy-backend/requirements.txt
```

Para habilitar o processamento de vídeo com IA, instale também as dependências
opcionais:

```sh
python -m pip install -r demoviefy-backend/ai-requirements.txt
```

### Modelos de IA

Os pesos dos modelos YOLO usados na análise de vídeo estão disponíveis neste
[Google Drive](https://drive.google.com/file/d/13vhemQYfFvuPWvoU9KqTxNKKEiNIpeZ8/view?usp=sharing).
Baixe e extraia o pacote na raiz do repositório, preservando a estrutura
`ai_model/model/` (por exemplo, `ai_model/model/Object_Detection/yolo26n.pt`).

## Iniciar a API

Com o ambiente virtual ativo, inicie o servidor:

```sh
python demoviefy-backend/run.py
```

A API fica disponível em `http://127.0.0.1:5000`. A interface web pode ser
iniciada seguindo o [guia do frontend](../demoviefy-frontend/README.md).

Para preparar ou atualizar os modelos locais de tradução Argos, execute na raiz
do repositório, com o ambiente ativado e acesso à internet:

```sh
python demoviefy-backend/scripts/install_translation_models.py
```

## Possíveis erros

Se ocorrerem erros relacionados ao uso da GPU durante o
processamento de IA (mais provável se GPU a utilizada for antiga e/ou pouco potente), é possível instalar as versões CPU do PyTorch e do
TorchVision. Execute os comandos abaixo com o ambiente virtual ativado e a partir
da raiz do repositório:

```sh
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Depois, continue a instalação dos outros pacotes de IA:

```sh
python -m pip install -r demoviefy-backend/ai-requirements.txt
```

**O processamento pela CPU pode ser mais lento do que pela GPU.**
