# Guia do Launcher

O launcher oferece uma interface para preparar o ambiente, iniciar os serviços
do DeMoviefy e acompanhar suas mensagens de execução. Ele é feito com Tkinter e
pode ser iniciado com o Python do sistema, mesmo antes da criação da `.venv`.

## Requisitos

- Python instalado e disponível no terminal (`python` ou `python3`).
- Node.js e npm disponíveis no `PATH` para instalar e iniciar o frontend.
- Acesso à internet para instalar dependências e baixar recursos que ainda não
  estejam instalados.
- Na primeira execução, permissão para criar a `.venv` dentro do repositório.

Para a instalação opcional de pacotes de IA, consulte também
[`ai-requirements.txt`](../demoviefy-backend/ai-requirements.txt); esses pacotes
podem exigir mais espaço em disco e demorar para baixar.

## Iniciar

Abra um terminal na raiz do repositório e execute:

```sh
python setup/main.py
```

Em sistemas nos quais o executável se chama `python3`, use:

```sh
python3 setup/main.py
```

Antes de abrir a janela, o terminal pergunta:

```text
Aplicar proxy da escola? (Y/n)
```

Digite `Y` para usar `http://proxy.spo.ifsp.edu.br:3128` nas operações de
subprocessos do launcher, como instalações com pip e npm. Qualquer outra
resposta inicia sem esse proxy.

## Preparar o ambiente

Na primeira utilização, clique em **Setup Environment**. O launcher executa as
etapas em segundo plano e mostra o progresso e as mensagens na própria janela:

1. Verifica a `.venv` na raiz do repositório e a cria ou recria se estiver
   ausente ou inválida.
2. Atualiza o pip e instala as dependências de build e do backend.
3. Instala as dependências JavaScript do frontend com `npm install`.
4. Exibe `Ready` ao concluir ou `Setup failed` se uma etapa obrigatória falhar;
   consulte o **Activity log** para os detalhes.

### Instalar pacotes de IA

Antes de iniciar o setup, marque **Instalar Pacotes de IA** para também instalar
as dependências pesadas definidas em `demoviefy-backend/ai-requirements.txt` e
executar o script de download dos modelos de IA. Deixe desmarcado para pular
essas etapas. A seleção é lida quando **Setup Environment** é acionado.

O botão de setup fica desabilitado enquanto a configuração está em andamento.
Não é necessário executar o setup novamente se o ambiente já estiver pronto,
exceto para reparar uma `.venv` inválida ou atualizar/instalar dependências.

## Serviços

Os botões na seção **Services** controlam os processos de backend e frontend:

- **Start Backend** inicia `demoviefy-backend/run.py` usando o Python da `.venv`
  (ou o Python que iniciou o launcher se a `.venv` ainda não existir).
- **Start Frontend** inicia `npm run dev` em `demoviefy-frontend/`. Node.js e
  npm precisam estar instalados.
- **Start All** inicia os dois serviços, backend e frontend.
- **Stop All** encerra todos os processos iniciados e gerenciados pelo launcher.

Os estados `Running` e `Stopped` são atualizados na seção **System status**.
As saídas e erros dos processos aparecem em **Activity log**. Se um serviço já
estiver em execução pelo launcher, tentar iniciá-lo novamente apenas registra
que ele já está ativo.

Fechar a janela também solicita o encerramento dos processos iniciados pelo
launcher. Serviços iniciados manualmente em outros terminais não são gerenciados
por ele.

## FFmpeg

O status **FFMPEG** informa se o executável foi encontrado. Clique em
**Install FFmpeg** para tentar instalá-lo automaticamente quando estiver
ausente:

- Windows: baixa os executáveis para `.ffmpeg/bin`.
- Linux: tenta `apt`, depois `dnf` (podendo pedir `sudo`) e, como alternativa,
  baixa uma distribuição estática.
- macOS: tenta usar `brew install ffmpeg`.

Se a instalação automática não estiver disponível ou falhar, instale o FFmpeg
manualmente e certifique-se de que `ffmpeg` esteja no `PATH`. O launcher
verifica a disponibilidade novamente e mostra o caminho encontrado quando
aplicável.

## Teste opcional de IA

Na seção **Tools**, informe o caminho de um vídeo em **Optional AI pipeline
check** (opcional) e clique em **Run AI Test**. O launcher chama o script
definido por `TEST_APP` em `setup/config.py`, passando o caminho informado como
argumento. O processo roda em segundo plano e suas mensagens são registradas no
**Activity log**.

> **Observação:** na configuração atual, `TEST_APP` aponta para
> `ai_model/app/app.py`. Esse arquivo precisa existir para que o teste seja
> executado; se estiver ausente, verifique a configuração ou adicione o script
> de teste esperado pelo projeto.

## Logs e aparência

- **Activity log** reúne mensagens do setup e dos processos iniciados pelo
  launcher, incluindo códigos de saída.
- **Clear Log** limpa as mensagens exibidas na janela; não interrompe os
  processos nem apaga arquivos de log externos.
- **Copy Log** copia o conteúdo visível para a área de transferência.
- A aparência clara/escura é detectada automaticamente com `darkdetect` quando
  disponível. O launcher verifica alterações no tema enquanto permanece aberto.

## Problemas comuns

- **`npm` não encontrado:** instale Node.js, confirme que `npm` funciona no
  terminal e execute **Setup Environment** novamente para instalar os pacotes
  do frontend.
- **Dependências Python ausentes:** execute **Setup Environment** e confira se
  a instalação terminou com `Ready`.
- **Proxy/rede:** responda `Y` à pergunta inicial para usar o proxy da escola
  nas operações com pip/npm do launcher.
- **Setup falhou:** veja a primeira mensagem de erro no **Activity log**,
  confirme acesso à rede e espaço em disco e tente novamente após corrigir a
  causa.
- **Serviço não inicia:** confira sua saída no **Activity log** e valide que o
  setup terminou, que o backend/frontend existem e que suas dependências foram
  instaladas.
