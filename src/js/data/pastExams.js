// Referências (não o conteúdo) dos concursos de Soldado da PMES já realizados,
// levantadas por pesquisa pública. Propositalmente NÃO reproduzimos o texto de
// nenhuma questão de prova real aqui — apenas metadados e links para que o
// candidato consulte a fonte original por conta própria. Ver README para a
// justificativa legal completa dessa decisão.
//
// Campos não confirmados com uma fonte oficial aparecem como `null` — nunca
// inventamos um valor plausível para preencher a lacuna.
export const PAST_EXAMS = [
  {
    year: 2026,
    cargo: 'Soldado Combatente (CFSd)',
    banca: 'IDECAN',
    vagas: 1008,
    status: 'Edital vigente',
    sourceLabel: 'Edital de abertura oficial (PMES)',
    sourceUrl: 'https://pm.es.gov.br/Media/PMES/Concursos/CFSd2026/EDITAL%20DE%20ABERTURA%20-%20CFSD%20COMBATENTE%202026.pdf',
    sourceType: 'oficial',
  },
  {
    year: 2022,
    cargo: 'Soldado Combatente (QPMP-C)',
    banca: 'Instituto AOCP',
    vagas: 1052,
    status: 'Concluído',
    sourceLabel: 'Gabarito preliminar oficial (PMES)',
    sourceUrl: 'https://pm.es.gov.br/Media/PMES/Concursos/CFSD2022_COMB/PM-ES%20Soldado%20Combatente%20-%20Gabarito%20Preliminar%2001-2022.pdf',
    sourceType: 'oficial',
  },
  {
    year: 2018,
    cargo: 'Soldado Combatente',
    banca: 'AOCP',
    vagas: 250,
    status: 'Concluído',
    sourceLabel: 'Cobertura da época (fonte secundária — link oficial não localizado)',
    sourceUrl: 'https://www.qconcursos.com/questoes-militares/provas',
    sourceType: 'agregador',
  },
  {
    year: 2014,
    cargo: 'Soldado',
    banca: null,
    vagas: 1623,
    status: 'Concluído',
    sourceLabel: 'Catálogo de provas (agregador — banca não confirmada)',
    sourceUrl: 'https://www.qconcursos.com/questoes-militares/concursos/pm-es-2014-soldado',
    sourceType: 'agregador',
  },
];

export const PAST_EXAMS_DISCLAIMER =
  'Esta tela lista apenas metadados e links públicos sobre concursos anteriores da PMES — nenhuma questão de prova real foi copiada para o banco de questões deste app. Isso é proposital: sem confirmar os direitos de reprodução de cada banca, copiar o conteúdo das provas seria um risco autoral que não nos cabe assumir. Para estudar pelas provas originais, use os links abaixo para consultar a fonte diretamente. "Fonte oficial" aponta para pm.es.gov.br; "agregador" aponta para sites de terceiros quando não localizamos o PDF oficial — nesses casos a banca ou outros dados podem não estar confirmados.';
