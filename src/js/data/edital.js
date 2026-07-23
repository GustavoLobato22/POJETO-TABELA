// Resumo estruturado do concurso de Soldado Combatente da PMES, com base em
// informações públicas do edital de abertura mais recente e do histórico de
// concursos anteriores da corporação. Datas, números de vagas e valores
// variam a cada edital — consulte sempre o edital oficial vigente em
// pm.es.gov.br antes de tomar decisões com base nestes dados.
export const EDITAL_INFO = {
  banca: 'IDECAN',
  cargo: 'Soldado Combatente PM-ES (Curso de Formação de Soldados)',
  cargaHorariaCFSd: '1.600 horas, em regime integral, na Academia da PMES',
  disclaimer:
    'Os dados abaixo resumem publicamente o formato mais recente do concurso da PMES para fins de orientação de estudo. Eles não substituem o edital oficial: prazos, notas de corte, quantidade de vagas e requisitos podem mudar a cada certame. Sempre confira o edital vigente antes da inscrição.',
  etapas: [
    {
      titulo: 'Exame intelectual (prova objetiva + redação)',
      descricao: 'Etapa eliminatória e classificatória. 80 questões objetivas de múltipla escolha (5 alternativas) e uma redação dissertativo-argumentativa.',
    },
    {
      titulo: 'Aferição de idade / documentação',
      descricao: 'Conferência de requisitos de idade e documentos exigidos no edital.',
    },
    {
      titulo: 'Teste de Aptidão Física (TAF)',
      descricao: 'Eliminatório, aplicado aos aprovados na etapa intelectual, conforme o Manual de Aplicação do TAF da PMES vigente.',
    },
    {
      titulo: 'Avaliação psicológica',
      descricao: 'Eliminatória, conforme perfil profissiográfico do cargo descrito no edital.',
    },
    {
      titulo: 'Investigação social',
      descricao: 'Verificação de idoneidade moral e conduta pública e privada: certidões de antecedentes criminais e certidões negativas das Justiças Federal, Estadual, Eleitoral e Militar.',
    },
    {
      titulo: 'Exames de saúde',
      descricao: 'Avaliação da capacidade física e psicofisiológica, incluindo exame toxicológico de larga janela de detecção.',
    },
    {
      titulo: 'Curso de Formação de Soldados (CFSd)',
      descricao: 'Etapa final, eliminatória e classificatória, com carga horária mínima de 1.600 horas na Academia da PMES.',
    },
  ],
  provaObjetiva: {
    totalQuestoes: 80,
    alternativasPorQuestao: 5,
    blocos: [
      { disciplina: 'Língua Portuguesa', questoes: 20 },
      { disciplina: 'Raciocínio Lógico e Matemático', questoes: 20 },
      { disciplina: 'Geografia do Brasil e do Espírito Santo', questoes: 20 },
      { disciplina: 'História do Brasil e do Espírito Santo', questoes: 20 },
    ],
    criterioAprovacao:
      'Historicamente a banca exige um percentual mínimo de acertos no total da prova e um percentual mínimo por disciplina (ex.: 40–50% geral e 20–30% em cada bloco). Confira o percentual exato no edital vigente, pois ele pode mudar a cada concurso.',
  },
  redacao: {
    tipo: 'Dissertativo-argumentativo',
    tamanho: '20 a 30 linhas',
    pontuacaoMaxima: 40,
    aprovacao: 'Historicamente exige-se around 50% de aproveitamento da pontuação máxima. Caráter eliminatório e classificatório.',
    dicas: [
      'Fuja da cópia dos textos de apoio: parafraseie e traga repertório próprio (dados, exemplos, legislação).',
      'Estruture em 4 a 5 parágrafos: introdução com tese, 2-3 parágrafos de desenvolvimento com um argumento por parágrafo, conclusão com proposta de intervenção quando pedido.',
      'Revise concordância, regência e pontuação nos últimos 3 minutos — bancas descontam por desvios gramaticais.',
      'Respeite rigorosamente o número de linhas: textos fora do intervalo podem ser anulados ou penalizados.',
    ],
  },
  taf: {
    caraterEliminatorio: true,
    observacao:
      'O TAF da PMES normalmente inclui teste de corrida, flexão de braços (apoio) e abdominais, com índices mínimos que variam por edital, sexo e faixa etária, conforme o Manual de Aplicação do TAF vigente. Não invente índices: confira sempre o manual oficial do concurso em andamento.',
    dicasGerais: [
      'Comece o preparo físico com pelo menos 3 a 4 meses de antecedência.',
      'Treine especificamente os testes do manual (corrida na distância exata, mesmo exercício de força), não apenas condicionamento genérico.',
      'Simule o TAF completo pelo menos duas vezes antes da data oficial, no mesmo horário do dia previsto para a prova.',
    ],
  },
  examesComplementares: {
    psicologico: 'Avaliação eliminatória baseada no perfil profissiográfico do cargo; geralmente inclui testes psicotécnicos e entrevista.',
    investigacaoSocial: 'Levantamento de vida pregressa, antecedentes criminais e certidões negativas em múltiplas esferas da Justiça.',
    saude: 'Exames clínicos, laboratoriais, de imagem e toxicológico, conforme tabela de aptidão do edital.',
  },
};
