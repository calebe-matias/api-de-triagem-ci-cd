# API de Triagem CI CD

Projeto criado para medir execucoes reais de um pipeline CI/CD no GitHub Actions.

## Stack

- Node.js 20+
- Fastify
- TypeScript
- Vitest
- ESLint

## Scripts principais

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run metrics:collect
npm run charts
```

## Reproducao do experimento

1. Autentique a CLI do GitHub com `gh auth login`.
2. Execute e envie os 12 commits descritos em `docs/experiment-log.md`.
3. Rode `npm run metrics:collect -- --owner calebe-matias --repo api-de-triagem-ci-cd`.
4. Rode `npm run charts`.
5. Atualize `docs/report.md` com os IDs reais e links gerados.

