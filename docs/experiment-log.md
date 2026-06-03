# Log do Experimento

| Execucao | Commit | Hipotese | Variacao | Run ID | Link |
| --- | --- | --- | --- | --- | --- |
| exp01 | `exp01: baseline passing pipeline` | Pipeline completo deve passar em tempo baixo. | Baseline com cache ligado, jobs sequenciais e 24 testes. | A preencher | A preencher |
| exp02 | `exp02: disable npm cache` | Sem cache, instalacao de dependencias deve ficar mais lenta. | Cache npm desligado. | A preencher | A preencher |
| exp03 | `exp03: enable npm cache` | Reativar cache deve reduzir tempo de instalacao. | Cache npm ligado. | A preencher | A preencher |
| exp04 | `exp04: introduce failing risk test` | Falha em teste deve encerrar workflow com status failure. | Teste de risco intencionalmente falho. | A preencher | A preencher |
| exp05 | `exp05: fix failing risk test` | Corrigir teste deve restaurar pipeline verde. | Teste de risco corrigido. | A preencher | A preencher |
| exp06 | `exp06: add slow triage test` | Teste lento deve aumentar duracao do job de testes. | Delay artificial em teste de triagem. | A preencher | A preencher |
| exp07 | `exp07: remove slow triage test` | Remover teste lento deve reduzir duracao. | Delay artificial removido. | A preencher | A preencher |
| exp08 | `exp08: increase generated test cases` | Mais casos parametrizados devem aumentar duracao dos testes. | Volume aumentado para 160 testes. | A preencher | A preencher |
| exp09 | `exp09: split jobs in parallel` | Paralelismo deve reduzir tempo total quando jobs sao independentes. | Quality e test em paralelo. | A preencher | A preencher |
| exp10 | `exp10: force sequential jobs` | Sequencial deve ser mais lento, mas com fluxo mais previsivel. | Test depende de quality. | A preencher | A preencher |
| exp11 | `exp11: introduce lint failure` | Falha de lint deve bloquear antes de usar feedback dos testes. | Variavel inutil criada. | A preencher | A preencher |
| exp12 | `exp12: fix lint and stabilize pipeline` | Pipeline final deve voltar a passar com dataset completo. | Lint corrigido e pipeline estabilizado. | A preencher | A preencher |
