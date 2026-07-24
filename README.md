# PMES Estudos

Plataforma de estudos para o concurso de **Soldado Combatente da Polícia
Militar do Espírito Santo (PMES)** — banco de questões, simulados
cronometrados, flashcards com repetição espaçada, plano de estudos
adaptativo, estatísticas, gamificação e um tutor de IA embutido em cada
questão.

É uma PWA estática (HTML/CSS/JS puro, sem build step), instalável no
celular e no desktop, com todos os dados salvos localmente no dispositivo
(`localStorage`) — funciona offline depois do primeiro carregamento.

## Rodando localmente

```bash
npm start
# ou: npx http-server -p 8080 -c-1
```

Abra `http://localhost:8080`. Não há passo de build: os arquivos em
`src/` são servidos diretamente como módulos ES.

## Estrutura

```
src/js/
  data/       conteúdo: disciplinas, questões, flashcards, edital, badges, missões
  engine/     lógica pura: SRS (SM-2 + escada 24h–90d), plano de estudos,
              gamificação, estatísticas, tutor de IA
  store/      estado da aplicação (localStorage) + seletores derivados
  screens/    telas (uma função de render por tela)
  ui/         primitivas de overlay (page, sheet, toast)
  charts/     mini-renderizadores SVG (linha, barra, donut) sem dependências
  components/ componentes reutilizáveis (cartão de questão)
```

## Nota legal sobre o banco de questões

As **questões, alternativas, explicações e flashcards** deste projeto são
**conteúdo autoral**, escrito especificamente para esta plataforma — não
são transcrições de provas aplicadas pela banca organizadora. Optamos por
não incluir ou reproduzir provas anteriores completas por não termos como
garantir, neste ambiente, a licença de redistribuição desse material.

O conteúdo foi estruturado a partir de **informações públicas** sobre o
formato mais recente do concurso (disciplinas cobradas, quantidade de
questões por bloco, critério de redação, etapas do certame — ver
`src/js/data/edital.js`), obtidas por pesquisa na web durante o
desenvolvimento. Antes de qualquer decisão importante (inscrição, data de
prova, nota de corte), **confira sempre o edital oficial vigente** em
`pm.es.gov.br` — os dados aqui resumidos podem mudar a cada certame e
servem apenas como referência de estudo.

Se no futuro for obtida uma base de questões oficialmente licenciada (ex.:
parceria com um curso preparatório, banco próprio de questões autorais em
maior escala, ou provas em domínio público), ela pode ser adicionada em
`src/js/data/questions.js` seguindo o mesmo formato.

Por esse mesmo motivo, a tela **Perfil → Provas anteriores** (dados em
`src/js/data/pastExams.js`) também não reproduz nenhuma questão real: ela
lista apenas metadados (ano, cargo, banca quando confirmada, número de
vagas) e um link público para a fonte de cada concurso já realizado — a
maioria apontando diretamente para `pm.es.gov.br`. Quando não localizamos
o PDF oficial de um ano específico, o link aponta para um agregador
público e isso fica marcado explicitamente na tela, junto com qualquer
dado (como a banca) que não foi possível confirmar.

## O que está implementado

- **Banco de questões** com explicação completa por questão: por que a
  correta está certa, por que cada alternativa errada está errada, dicas,
  pegadinhas e atalhos de resolução — o "IA Professor" funciona 100%
  offline a partir desse conteúdo autoral.
- **Simulados** configuráveis (20/40/60/80/100 questões), com cronômetro
  proporcional ao tempo real de prova, distribuição por disciplina igual
  à do edital, resultado com nota, tempo, acertos por disciplina,
  comparação com simulados anteriores e uma estimativa (não garantia) de
  chance de aprovação.
- **Flashcards** com algoritmo SM-2 (o mesmo do Anki) e uma escada de
  revisão espaçada (24h / 7 / 15 / 30 / 60 / 90 dias) para questões
  erradas.
- **Plano de estudos** recalculado ao vivo a cada abertura, com base nos
  dias restantes até a prova e no desempenho por disciplina — não existe
  um cronograma fixo para "atrasar"; ele sempre reflete o estado atual.
- **Estatísticas**: visão geral, mapa de calor por disciplina, evolução
  diária/semanal/mensal.
- **Gamificação**: XP, níveis, sequência de estudos (streak), missões
  diárias e conquistas.
- **Modo foco**: Pomodoro (25/5 min) com ruído branco gerado localmente
  via Web Audio API (sem dependência de arquivos de áudio externos).
- **Redação**: guia de estrutura, dicas e um editor de rascunho com
  contagem aproximada de linhas.
- **Provas anteriores**: referências (ano, cargo, banca, link oficial) dos
  concursos de Soldado da PMES já realizados que conseguimos identificar
  por pesquisa pública — sem reproduzir questões reais (ver nota legal).
- Modo claro/escuro, PWA instalável, totalmente responsivo.

## Limitações conhecidas / próximos passos

Este é um app **cliente-only**: não há backend, banco de dados
compartilhado ou sincronização entre dispositivos — os dados vivem no
`localStorage` do navegador (é possível exportar um backup em JSON pela
tela de Configurações). Para uma versão multiusuário em produção real
(milhares de usuários, sincronização entre aparelhos, banco de questões
maior e curado por especialistas), o próximo passo natural seria migrar
`store/store.js` para uma API real (ex.: Next.js + Postgres/Supabase),
mantendo a mesma modelagem de dados já usada aqui.

O "IA Professor" de perguntas livres (Configurações → IA Professor) é
opcional e experimental: permite plugar uma chave de API própria
(Anthropic ou OpenAI) para tirar dúvidas além das questões, mas depende
de o provedor aceitar chamadas diretas do navegador (pode ser bloqueado
por CORS dependendo da conta/chave). A explicação automática de cada
questão **não depende disso** e funciona sempre, offline.
