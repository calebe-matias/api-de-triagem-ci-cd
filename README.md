# Ponderada de CI CD - API de Triagem

Desde o começo da faculdade, estive envolvido em iniciativas de empreendedorismo que foram responsáveis por grande parte do conhecimento técnico que tenho hoje. Dentre os projetos que desenvolvi estão a [Anamnai](https://app.anamnai.com), software de transcrição médica e o [RiskClassifier](https://app.anamnai.com/cross), sistema de priorização de riscos considerando protocolos do Sistema CROSS. Para esta ponderada, criei uma API simples de triagem e acompanhamento de atendimentos, inspirada no fluxo de atendimento do CROSS, para conseguir extrair as métricas de CI/CD da ponderada.

O projeto simula um fluxo simples de atendimento:

- cadastro de pacientes;
- registro de avaliações de triagem;
- cálculo de risco;
- abertura de tickets de acompanhamento;
- consulta de timeline do paciente.

## Como reproduzir o experimento:

Basta executar os checks locais:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:ci
```

Esses comandos validam a qualidade do código, a tipagem TypeScript e a suíte automatizada. No estado final da ponderada, a suíte executa 160 testes.

## Como executar a API localmente

```bash
npm ci
npm run dev
```

Depois, acesse:

```bash
curl http://localhost:3000/health
```

Exemplo de chamada:

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Maria Silva\",\"age\":38,\"document\":\"12345678900\"}"
```

## Como verificar o pipeline no GitHub Actions

O pipeline principal já está configurado em `.github/workflows/ci.yml` e roda automaticamente em `push` e `pull_request`.

Para avaliar que o pipeline funciona, basta abrir a aba **Actions** do repositório e verificar as execuções existentes, ou criar um pull request/commit próprio em um fork para disparar uma nova execução.

Workflow:

- instala dependências com `npm ci`;
- executa ESLint;
- executa typecheck TypeScript;
- executa testes com cobertura;
- publica artefatos com resultados dos testes e coverage.

## Dados do experimento já executado

As 12 execuções reais usadas no relatório já foram coletadas e versionadas:

- log das variações: [`docs/experiment-log.md`](docs/experiment-log.md);
- relatório técnico: [`docs/report.md`](docs/report.md);
- base CSV: [`metrics/runs.csv`](metrics/runs.csv);
- base JSON: [`metrics/runs.json`](metrics/runs.json);
- gráficos: [`reports/charts/`](reports/charts/).

Os commits `exp01` a `exp12` e seus respectivos IDs de workflow estão documentados em [`docs/experiment-log.md`](docs/experiment-log.md).

## Como regerar os gráficos a partir dos dados versionados

Não é preciso autenticar no GitHub para regerar os gráficos já entregues:

```bash
npm ci
npm run charts
```

O comando lê `metrics/runs.json` e recria os arquivos em `reports/charts/`.

## Como coletar novas métricas

Este passo é opcional e só é necessário se alguém quiser coletar novas execuções do GitHub Actions.

Nesse caso, a pessoa deve autenticar a própria CLI do GitHub em uma conta com acesso ao repositório ou ao fork:

```bash
gh auth login
npm run metrics:collect -- --owner <owner> --repo <repo>
npm run charts
```

Para a avaliação do experimento entregue, use os dados já versionados em `metrics/` e as evidências reais listadas em `docs/report.md`.
