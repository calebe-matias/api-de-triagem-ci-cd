# Relatório Técnico: Análise de Pipeline CI/CD

Aluno: Calebe Matias

## Repositório

- Repositório: https://github.com/calebe-matias/api-de-triagem-ci-cd
- Workflow YAML: https://github.com/calebe-matias/api-de-triagem-ci-cd/blob/main/.github/workflows/ci.yml
- Script de coleta: `scripts/collect-metrics.mjs`
- Base gerada: `metrics/runs.csv` e `metrics/runs.json`
- Gráficos: `reports/charts/`
- Total de execuções analisadas: 12

## Evidências reais

| Exp | Run ID | Status | Duração workflow | Testes | Falhas | Commit | Link |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| exp01 | `26899090948` | success | 52s | 24 | 0 | `c4429a1` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899090948 |
| exp02 | `26899169043` | success | 58s | 24 | 0 | `4042cd0` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899169043 |
| exp03 | `26899269186` | success | 54s | 24 | 0 | `e72ed68` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899269186 |
| exp04 | `26899370705` | failure | 52s | 24 | 1 | `28caad7` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899370705 |
| exp05 | `26899465232` | success | 58s | 24 | 0 | `b21d191` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899465232 |
| exp06 | `26899560979` | success | 55s | 24 | 0 | `4a41a8c` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899560979 |
| exp07 | `26899659061` | success | 60s | 24 | 0 | `be83a9c` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899659061 |
| exp08 | `26899758685` | success | 57s | 160 | 0 | `50e3562` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899758685 |
| exp09 | `26899855406` | success | 37s | 160 | 0 | `515aa02` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899855406 |
| exp10 | `26899959164` | success | 56s | 160 | 0 | `659e417` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899959164 |
| exp11 | `26900524758` | failure | 37s | 0 | 0 | `382e9ba` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26900524758 |
| exp12 | `26900622285` | success | 59s | 160 | 0 | `d53de68` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26900622285 |

## Hipótese inicial

O cache de dependências deveria reduzir o tempo de instalação, testes lentos e maior volume de casos deveriam aumentar a duração do job de testes, e a execução paralela deveria reduzir o tempo total quando lint/typecheck e testes fossem independentes.

## Gráficos gerados

- `reports/charts/workflow-duration.png`
- `reports/charts/job-duration.png`
- `reports/charts/success-failure-rate.png`
- `reports/charts/tests-vs-duration.png`

## Análise

### Qual etapa mais contribuiu para o tempo total do pipeline?

As médias por job foram: `lint and typecheck` com 16,42s, `automated tests` com 14,33s e `install dependencies` com 14,17s. A maior contribuição média veio de lint/typecheck, mas os três jobs ficaram próximos porque cada job reinstala dependências para manter isolamento.

### Houve diferença significativa entre execuções com e sem cache?

A comparação inicial foi: exp01 com cache em 52s, exp02 sem cache em 58s e exp03 com cache em 54s. Houve melhora pequena, de cerca de 4 a 6 segundos, mas não grande o suficiente para afirmar ganho forte com apenas uma repetição sem cache.

### O paralelismo reduziu o tempo total? Em que condições?

Sim. Com 160 testes, exp08 sequencial levou 57s, exp09 paralelo levou 37s e exp10 sequencial levou 56s. O paralelismo reduziu cerca de 20s quando `quality` e `test` puderam rodar em paralelo depois do job `install`.

### Quais falhas foram mais frequentes?

Houve duas falhas planejadas: uma falha de teste em exp04 e uma falha de lint em exp11. Como cada tipo ocorreu uma vez, não houve predominância estatística; o experimento mostra apenas que o pipeline diferencia falha funcional de falha estática.

### O pipeline fornece feedback rápido o suficiente para o desenvolvedor?

Sim para este escopo. As execuções bem-sucedidas ficaram em média em 54,6s. A falha de lint em exp11 retornou em 37s, o que é um feedback rápido para um erro simples de qualidade.

### Que melhorias poderiam ser feitas no pipeline?

Separar instalação compartilhada de dependências, reaproveitar artefatos entre jobs, aumentar repetições para cache ligado/desligado, adicionar labels de falha no artefato e gerar gráficos com rótulos textuais mais ricos.

### Quais limitações existem nos dados coletados?

O tamanho da amostra é pequeno, o ambiente GitHub-hosted varia entre execuções, cache foi comparado com poucas repetições, e a falha de lint não gera artefato de teste porque o job de testes é pulado no modo sequencial. Além disso, os tempos incluem overhead do runner, checkout e setup-node.

### Como essa análise poderia apoiar decisões de engenharia?

Os dados ajudam a decidir quando paralelizar jobs, se o cache compensa para um projeto pequeno, quais etapas merecem otimização e se o feedback do pipeline está dentro de um tempo aceitável para desenvolvimento diário.

## Resultados inesperados

1. O teste lento de 2,5s em exp06 não aumentou o tempo total em relação a exp05; exp05 levou 58s e exp06 levou 55s. O overhead e a variação do runner foram maiores que o atraso artificial.
2. A execução exp07, sem teste lento, levou 60s, maior que exp06. Isso reforça que pequenas diferenças locais de teste podem ser mascaradas por variação do ambiente do GitHub Actions.
3. O aumento de 24 para 160 testes em exp08 também não elevou muito a duração total, porque os testes gerados são baratos e o custo principal está em setup/install/lint.

## Comparação entre hipótese e resultado observado

A hipótese sobre paralelismo foi confirmada: exp09 reduziu o tempo total para 37s contra 57s/56s nas execuções sequenciais com 160 testes. A hipótese sobre cache foi apenas parcialmente confirmada, com ganho pequeno. A hipótese sobre teste lento e volume de testes não apareceu claramente nos tempos totais, pois o pipeline é dominado por overhead de jobs e instalação.

## Reprodução

```bash
npm ci
npm run lint
npm run typecheck
npm run test:ci
npm run metrics:collect -- --owner calebe-matias --repo api-de-triagem-ci-cd
npm run charts
```
