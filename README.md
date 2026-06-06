# API de Triagem CI CD

API de triagem e acompanhamento de atendimentos criada para um experimento de métricas de CI/CD no GitHub Actions.

O projeto simula um fluxo simples de atendimento:

- cadastro de pacientes;
- registro de avaliações de triagem;
- cálculo de risco;
- abertura de tickets de acompanhamento;
- consulta de timeline do paciente.

## Stack

- Node.js 20+
- Fastify
- TypeScript
- Vitest
- ESLint

## Como avaliar o funcionamento do código

Qualquer avaliador pode clonar o repositório e executar os checks locais sem autenticar a CLI do GitHub:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:ci
```

Esses comandos validam a qualidade do código, a tipagem TypeScript e a suíte automatizada. No estado final do experimento, a suíte executa 160 testes.

## Como executar a API localmente

```bash
npm ci
npm run dev
```

Depois, acesse:

```bash
curl http://localhost:3000/health
```

Exemplo de fluxo minimo:

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Maria Silva\",\"age\":38,\"document\":\"12345678900\"}"
```

## Como verificar o pipeline no GitHub Actions

O pipeline principal já está configurado em `.github/workflows/ci.yml` e roda automaticamente em `push` e `pull_request`.

Para avaliar que o pipeline funciona, não é necessário repetir os 12 commits do experimento. Basta abrir a aba **Actions** do repositório e verificar as execuções existentes, ou criar um pull request/commit próprio em um fork para disparar uma nova execução.

Workflow:

- instala dependências com `npm ci`;
- executa ESLint;
- executa typecheck TypeScript;
- executa testes com cobertura;
- publica artefatos com resultados dos testes e coverage.

## Dados do experimento já executado

As 12 execuções reais usadas no relatório já foram coletadas e versionadas:

- log das variações: `docs/experiment-log.md`;
- relatório técnico: `docs/report.md`;
- base CSV: `metrics/runs.csv`;
- base JSON: `metrics/runs.json`;
- gráficos: `reports/charts/`.

Os commits `exp01` a `exp12` e seus respectivos IDs de workflow estão documentados em `docs/experiment-log.md`.

## Como regenerar os gráficos a partir dos dados versionados

Não é preciso autenticar no GitHub para regenerar os gráficos já entregues:

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
