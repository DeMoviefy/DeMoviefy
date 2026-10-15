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

Para processar/analisar vídeos, instale também as dependências de IA no mesmo ambiente:

```powershell
.\.venv\Scripts\python.exe -m pip install -r demoviefy-backend\ai-requirements.txt
```

Sem esse passo, o endpoint ainda pode aceitar e salvar um upload, mas o processamento falha; por exemplo, `ModuleNotFoundError: No module named 'cv2'` indica que `opencv-python` não está instalado.

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
- A API usa por padrão o mesmo hostname do frontend na porta `5000`, para que o cookie `SameSite=Lax` funcione durante o login local. Se definir `VITE_API_URL`, use o mesmo hostname usado para abrir o frontend (`localhost` ou `127.0.0.1`).

## Variaveis uteis

- `PROXY_URL`: proxy HTTP/HTTPS para pip, npm e subprocessos do launcher
- `FRAME_AI_MODEL`: caminho alternativo para o modelo YOLO
- `FRAME_AI_FRAME_STRIDE`: intervalo de frames amostrados
- `FRAME_AI_CONFIDENCE`: confianca minima da detecção
- `FRAME_AI_MAX_FRAMES`: limite de frames processados
- `DEMOVIEFY_FRONTEND_ORIGINS`: origens do frontend permitidas para chamadas com sessão, separadas por vírgula (padrão: `http://localhost:5173,http://127.0.0.1:5173`)
- `DEMOVIEFY_SECRET_KEY`: segredo persistente usado para assinar sessões Flask
- `DEMOVIEFY_SESSION_LIFETIME_MINUTES`: duração configurável do cookie de sessão em minutos (padrão: `30`; deve ser um inteiro positivo)
- `DEMOVIEFY_SESSION_COOKIE_SECURE`: use `true` em HTTPS para exigir envio do cookie apenas por conexões seguras (padrão: `false` para desenvolvimento local)
- `DEMOVIEFY_ADMIN_USER_ID`: ID de um usuário existente com acesso administrativo a todos os vídeos; quando definido, vídeos legados sem proprietário são atribuídos a essa conta. Crie a conta pela tela de cadastro, consulte o ID em `/users/me` após entrar e configure a variável antes de reiniciar o backend.

Os endpoints `/videos` aceitam uma sessão privada de convidado ou uma sessão autenticada. Convidados só acessam seus próprios vídeos temporários; usuários comuns só acessam os vídeos da própria conta; apenas o usuário configurado em `DEMOVIEFY_ADMIN_USER_ID` pode listar e acessar todos. Em bancos existentes, configure o ID de uma conta existente como administrador para atribuir a ela vídeos legados sem proprietário; enquanto isso, esses vídeos permanecem invisíveis para usuários comuns.

Visitantes podem enviar até três vídeos por sessão privada de convidado. Os IDs dos vídeos são únicos no banco, mas não concedem acesso: cada solicitação também precisa apresentar o cookie assinado da sessão do próprio visitante. Vídeos e arquivos temporários de convidados são removidos quando o backend reinicia; recarregar somente a página não apaga a sessão. Depois de criar uma conta, o visitante deve entrar nela na mesma sessão do navegador para transferir os vídeos temporários à biblioteca da conta. Outras sessões de convidado não podem ver esses vídeos.

O cookie `demoviefy_session` é HTTP-only, usa `SameSite=Lax` e tem duração padrão de 30 minutos sem atividade. A expiração é renovada a cada requisição que usa a sessão. Em produção com HTTPS, defina `DEMOVIEFY_SESSION_COOKIE_SECURE=true`; mantenha-a desativada para desenvolvimento local em HTTP.

### Roadmap de verificação manual

Execute em ambiente local ou de teste, nunca com vídeos/dados de produção. Marque cada resultado como **Passou** ou **Falhou** e registre navegador, horário e configuração usada.

| ID | Verificação | Passa quando |
|---|---|---|
| CK01 | Abra o frontend em uma janela privada e entre no dashboard. Em DevTools → Application/Storage → Cookies, procure `demoviefy_session`. | O cookie é criado depois que a aplicação consulta a sessão. |
| CK02 | Inspecione os atributos do cookie em HTTP local. | `HttpOnly` está ativo, `SameSite` é `Lax`, `Secure` está desativado e a expiração está aproximadamente 30 minutos à frente. |
| CK03 | Com `DEMOVIEFY_SESSION_LIFETIME_MINUTES=1`, crie uma sessão, faça uma requisição e espere 30 segundos. Faça outra chamada que use a sessão e volte a inspecionar a expiração. | A nova expiração fica aproximadamente um minuto à frente da segunda chamada. |
| CK04 | Ainda com a duração de 1 minuto, pare de usar a aplicação por mais de um minuto. Depois consulte a sessão ou abra a biblioteca novamente. | A sessão anterior expirou e o backend cria uma nova sessão de convidado. Vídeos ainda não transferidos para uma conta deixam de estar acessíveis por essa sessão antiga; o registro e os arquivos temporários são removidos no próximo reinício do backend. |
| CK05 | Restaure a duração padrão de 30 minutos. Em um ambiente HTTPS de teste, defina `DEMOVIEFY_SESSION_COOKIE_SECURE=true` e crie uma sessão nova. | O cookie contém `Secure` e o navegador não o envia por HTTP. Não ative essa opção em desenvolvimento local servido por HTTP. |
| GS01 | Em uma janela privada, sem fazer login, abra o dashboard e envie três vídeos válidos. | Os três uploads funcionam; a tela mostra `3 de 3` e apresenta links para entrar ou criar conta. |
| GS02 | Tente enviar um quarto vídeo como convidado, inclusive repetindo a chamada de upload pela API. | O frontend bloqueia o envio e a API rejeita a tentativa; a validação do limite é feita no backend. |
| GS03 | Abra uma segunda janela privada e tente listar os vídeos ou abrir um ID conhecido da primeira janela. | A segunda sessão não lista nem consegue abrir os vídeos da primeira. Conhecer um ID não concede acesso sem o cookie da sessão proprietária. |
| GS04 | Recarregue a primeira janela antes da expiração do cookie. | A lista continua acessível e mantém os vídeos daquela sessão. Atualizar a página não equivale a reiniciar o backend. |
| AC01 | Na primeira janela, crie uma conta e depois entre com essa conta antes de a sessão de convidado expirar. | Os vídeos temporários da sessão aparecem na biblioteca da conta. Cadastro, por si só, não transfere os vídeos; é preciso fazer login na mesma sessão do navegador. |
| AC02 | Entre com a mesma conta na segunda janela privada. | Os vídeos da primeira sessão foram transferidos para a conta e aparecem como vídeos da conta após autenticação. |
| CL01 | Em ambiente local, reinicie o backend enquanto ainda houver vídeos de convidado não transferidos. | Os registros temporários e arquivos/artefatos desses vídeos são removidos; vídeos já transferidos para uma conta permanecem. |
| AU01 | Como usuário autenticado, envie e liste vídeos; depois tente abrir o ID de vídeo pertencente a outra conta. | Seus vídeos continuam acessíveis e o vídeo alheio não é revelado. |

**Limpeza:** depois do teste acelerado, remova `DEMOVIEFY_SESSION_LIFETIME_MINUTES` ou restaure `30`. Restaure também `DEMOVIEFY_SESSION_COOKIE_SECURE=false` se voltar ao HTTP local. Cookies criados antes de mudar as configurações podem continuar no navegador; use uma janela privada nova para cada rodada.

### Roteiro automatizado

Na raiz do repositório, com o ambiente `.venv` instalado:

```powershell
# Guest limit, guest-session isolation, cleanup and ownership acceptance cases
.\test.ps1 -Test CT12
.\test.ps1 -Test CT13
.\test.ps1 -Test CT14
.\test.ps1 -Test SEC05

# Cookie attributes, expiration, configurable Secure flag, login and transfer
Push-Location .\demoviefy-backend
& ..\.venv\Scripts\python.exe -m unittest discover -s tests -p 'test_user_registration.py' -v
Pop-Location

# Full backend acceptance suite
.\test.ps1 -All
```

Os testes automatizados verificam os atributos e a duração configurada do cookie sem esperar 30 minutos reais. CK03–CK05 verificam o comportamento real de expiração e HTTPS no navegador.

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
