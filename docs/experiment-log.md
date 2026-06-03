# Log do Experimento

| Execucao | Commit | SHA | Hipotese | Variacao | Run ID | Link |
| --- | --- | --- | --- | --- | --- | --- |
| exp01 | `exp01: baseline passing pipeline` | `c4429a1` | Pipeline completo deve passar em tempo baixo. | Baseline com cache ligado, jobs sequenciais e 24 testes. | `26899090948` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899090948 |
| exp02 | `exp02: disable npm cache` | `4042cd0` | Sem cache, instalacao de dependencias deve ficar mais lenta. | Cache npm desligado. | `26899169043` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899169043 |
| exp03 | `exp03: enable npm cache` | `e72ed68` | Reativar cache deve reduzir tempo de instalacao. | Cache npm ligado. | `26899269186` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899269186 |
| exp04 | `exp04: introduce failing risk test` | `28caad7` | Falha em teste deve encerrar workflow com status failure. | Teste de risco intencionalmente falho. | `26899370705` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899370705 |
| exp05 | `exp05: fix failing risk test` | `b21d191` | Corrigir teste deve restaurar pipeline verde. | Teste de risco corrigido. | `26899465232` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899465232 |
| exp06 | `exp06: add slow triage test` | `4a41a8c` | Teste lento deve aumentar duracao do job de testes. | Delay artificial de 2,5s em teste de triagem. | `26899560979` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899560979 |
| exp07 | `exp07: remove slow triage test` | `be83a9c` | Remover teste lento deve reduzir duracao. | Delay artificial removido. | `26899659061` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899659061 |
| exp08 | `exp08: increase generated test cases` | `50e3562` | Mais casos parametrizados devem aumentar duracao dos testes. | Volume aumentado para 160 testes. | `26899758685` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899758685 |
| exp09 | `exp09: split jobs in parallel` | `515aa02` | Paralelismo deve reduzir tempo total quando jobs sao independentes. | Quality e test em paralelo depois de install. | `26899855406` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899855406 |
| exp10 | `exp10: force sequential jobs` | `659e417` | Sequencial deve ser mais lento, mas com fluxo mais previsivel. | Test depende de quality. | `26899959164` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26899959164 |
| exp11 | `exp11: introduce lint failure` | `382e9ba` | Falha de lint deve bloquear antes de usar feedback dos testes. | Variavel inutil criada para falhar ESLint. | `26900524758` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26900524758 |
| exp12 | `exp12: fix lint and stabilize pipeline` | `d53de68` | Pipeline final deve voltar a passar com dataset completo. | Lint corrigido e pipeline estabilizado. | `26900622285` | https://github.com/calebe-matias/api-de-triagem-ci-cd/actions/runs/26900622285 |

