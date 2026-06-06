# API de Triagem CI CD

API de triagem e acompanhamento de atendimentos criada para um experimento de metricas de CI/CD no GitHub Actions.

O projeto simula um fluxo simples de atendimento:

- cadastro de pacientes;
- registro de avaliacoes de triagem;
- calculo de risco;
- abertura de tickets de acompanhamento;
- consulta de timeline do paciente.

## Stack

- Node.js 20+
- Fastify
- TypeScript
- Vitest
- ESLint

## Como avaliar o funcionamento do codigo

Qualquer avaliador pode clonar o repositorio e executar os checks locais sem autenticar a CLI do GitHub:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:ci
```

Esses comandos validam a qualidade do codigo, a tipagem TypeScript e a suite automatizada. No estado final do experimento, a suite executa 160 testes.

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

O pipeline principal ja esta configurado em `.github/workflows/ci.yml` e roda automaticamente em `push` e `pull_request`.

Para avaliar que o pipeline funciona, nao e necessario repetir os 12 commits do experimento. Basta abrir a aba **Actions** do repositorio e verificar as execucoes existentes, ou criar um pull request/commit proprio em um fork para disparar uma nova execucao.

Workflow:

- instala dependencias com `npm ci`;
- executa ESLint;
- executa typecheck TypeScript;
- executa testes com cobertura;
- publica artefatos com resultados dos testes e coverage.

## Dados do experimento ja executado

As 12 execucoes reais usadas no relatorio ja foram coletadas e versionadas:

- log das variacoes: `docs/experiment-log.md`;
- relatorio tecnico: `docs/report.md`;
- base CSV: `metrics/runs.csv`;
- base JSON: `metrics/runs.json`;
- graficos: `reports/charts/`.

Os commits `exp01` a `exp12` e seus respectivos IDs de workflow estao documentados em `docs/experiment-log.md`.

## Como regenerar os graficos a partir dos dados versionados

Nao e preciso autenticar no GitHub para regenerar os graficos ja entregues:

```bash
npm ci
npm run charts
```

O comando le `metrics/runs.json` e recria os arquivos em `reports/charts/`.

## Como coletar novas metricas

Este passo e opcional e so e necessario se alguem quiser coletar novas execucoes do GitHub Actions.

Nesse caso, a pessoa deve autenticar a propria CLI do GitHub em uma conta com acesso ao repositorio ou ao fork:

```bash
gh auth login
npm run metrics:collect -- --owner <owner> --repo <repo>
npm run charts
```

Para a avaliacao do experimento entregue, use os dados ja versionados em `metrics/` e as evidencias reais listadas em `docs/report.md`.

