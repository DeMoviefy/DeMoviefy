# Testes do DeMoviefy

Abra o menu de testes a partir da raiz do repositório:

```powershell
.\demoviefy-backend\test.ps1
```

Escolha uma das opções:

1. Executar todos os cenários funcionais e de segurança (CT01-CT14 e SEC01-SEC05).
2. Executar um cenário, como CT03.
3. Executar todos os cenários e compilar o frontend.

Para executar todos os testes sem abrir o menu:

```powershell
.\demoviefy-backend\test.ps1 -All
```

Para executar um cenário específico:

```powershell
.\demoviefy-backend\test.ps1 -Test CT03
```

Para também verificar se o frontend compila corretamente:

```powershell
.\demoviefy-backend\test.ps1 -Frontend
```

O script usa o ambiente `.venv` do projeto e executa os cenários de aceitação em
`demoviefy-backend/tests/test_test_plan.py`. Para executar todos os módulos de
teste do backend, incluindo os testes de cadastro, sessão e limpeza de arquivos
gerados:

```powershell
Push-Location .\demoviefy-backend
..\.venv\Scripts\python.exe -m unittest discover -s tests -v
Pop-Location
```

## O que é verificado

`test_test_plan.py` implementa os cenários do plano oficial de testes:

| ID | Verificação automatizada |
| --- | --- |
| CT01 | Um vídeo compatível é salvo e adicionado à fila de processamento. |
| CT02 | Tipos de arquivo incompatíveis são rejeitados antes do processamento. |
| CT03 | Uma transcrição concluída é retornada ao cliente. |
| CT04 | Resultados de áudio de baixa qualidade não interrompem o fluxo de transcrição. |
| CT05 | São retornados rótulos de conteúdo sensível e timestamps relevantes. |
| CT06 | Resultados parciais de análise e transcrição retornam `202` enquanto o processamento continua. |
| CT07 | Atualizações manuais da transcrição são permitidas; atualizações da análise por IA são rejeitadas. |
| CT08 | Vários uploads são aceitos e cada vídeo é adicionado à fila. |
| CT09 | Arquivos com nomes duplicados são armazenados separadamente. |
| CT10 | A exclusão de um vídeo remove seus arquivos associados e o registro no banco de dados. |
| CT11 | Uma falha ao limpar os arquivos preserva o registro do vídeo no banco de dados. |
| CT12 | A visibilidade dos vídeos é limitada ao proprietário e aos administradores configurados. |
| CT13 | Os limites de upload de convidados e o isolamento de vídeos por sessão são aplicados. |
| CT14 | Vídeos de convidados e seus arquivos são removidos quando o backend reinicia. |

Os cenários de segurança também podem ser executados individualmente:

| ID | Verificação automatizada |
| --- | --- |
| SEC01 | Nomes de arquivo com tentativa de travessia de diretórios são sanitizados e permanecem dentro do armazenamento. |
| SEC02 | Parâmetros inválidos de frame, confiança e trecho são rejeitados. |
| SEC03 | Status de vídeo desconhecidos são rejeitados sem alterar o estado. |
| SEC04 | IDs de vídeo desconhecidos não expõem recursos. |
| SEC05 | Sessões privadas de vídeos de convidados são isoladas. |

Uma verificação de regressão adicional confirma que, após um upload autenticado,
o cookie de sessão continua autorizando a geração e edição de transcrições, o
reprocessamento e a exclusão de vídeos.

## Limites dos testes

Estes testes de aceitação são rápidos e reproduzíveis. Eles usam arquivos
temporários e um banco de dados SQLite temporário, e simulam os resultados da IA
em vez de baixar ou executar os modelos Whisper/YOLO.

A parte de infraestrutura do CT08 ainda precisa de um teste de carga separado
no ambiente implantado com Nginx e Flask, pois o Nginx não faz parte do processo
de testes do Flask.

Verificações de segurança opcionais para um ambiente de desenvolvimento:

```powershell
python -m pip install bandit pip-audit ruff
bandit -r demoviefy-backend/app
pip-audit -r demoviefy-backend/requirements.txt
ruff check demoviefy-backend
```
