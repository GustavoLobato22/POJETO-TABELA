// Disciplinas da prova objetiva do CFSd (Curso de Formação de Soldados) da PMES,
// conforme a estrutura do edital de abertura mais recente (IDECAN): 80 questões
// objetivas de múltipla escolha (5 alternativas), divididas em 4 blocos de 20
// questões, mais uma redação dissertativo-argumentativa (ver data/edital.js).
export const SUBJECTS = [
  {
    id: 'portugues',
    label: 'Língua Portuguesa',
    short: 'Português',
    color: '#1C3F72',
    icon: 'book',
    examQuestions: 20,
    topics: [
      { id: 'interpretacao', label: 'Interpretação de texto' },
      { id: 'ortografia', label: 'Ortografia e acentuação' },
      { id: 'classes-gramaticais', label: 'Classes gramaticais' },
      { id: 'concordancia', label: 'Concordância verbal e nominal' },
      { id: 'regencia-crase', label: 'Regência e crase' },
      { id: 'pontuacao', label: 'Pontuação' },
      { id: 'semantica', label: 'Semântica e figuras de linguagem' },
    ],
  },
  {
    id: 'rlm',
    label: 'Raciocínio Lógico e Matemático',
    short: 'RLM',
    color: '#B9832A',
    icon: 'brain',
    examQuestions: 20,
    topics: [
      { id: 'logica-proposicional', label: 'Lógica proposicional' },
      { id: 'porcentagem', label: 'Porcentagem' },
      { id: 'razao-proporcao', label: 'Razão e proporção' },
      { id: 'regra-de-tres', label: 'Regra de três simples e composta' },
      { id: 'juros', label: 'Juros simples e compostos' },
      { id: 'sequencias', label: 'Sequências e sucessões lógicas' },
      { id: 'geometria', label: 'Geometria básica' },
      { id: 'combinatoria', label: 'Contagem e probabilidade básica' },
    ],
  },
  {
    id: 'geografia',
    label: 'Geografia do Brasil e do Espírito Santo',
    short: 'Geografia',
    color: '#16A34A',
    icon: 'mapPin',
    examQuestions: 20,
    topics: [
      { id: 'geografia-fisica-brasil', label: 'Geografia física do Brasil' },
      { id: 'geografia-humana', label: 'Geografia humana e demografia' },
      { id: 'geografia-es', label: 'Geografia do Espírito Santo' },
      { id: 'economia-urbanizacao', label: 'Economia e urbanização' },
      { id: 'meio-ambiente', label: 'Meio ambiente' },
      { id: 'geopolitica', label: 'Geopolítica e atualidades' },
    ],
  },
  {
    id: 'historia',
    label: 'História do Brasil e do Espírito Santo',
    short: 'História',
    color: '#7C3AED',
    icon: 'scroll',
    examQuestions: 20,
    topics: [
      { id: 'brasil-colonia', label: 'Brasil Colônia' },
      { id: 'brasil-imperio', label: 'Brasil Império' },
      { id: 'brasil-republica', label: 'Brasil República' },
      { id: 'historia-es', label: 'História do Espírito Santo' },
      { id: 'historia-pm', label: 'História institucional da PM' },
    ],
  },
];

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopic(subjectId, topicId) {
  const subject = getSubject(subjectId);
  return subject?.topics.find((t) => t.id === topicId);
}

export function allTopicsFlat() {
  return SUBJECTS.flatMap((s) => s.topics.map((t) => ({ ...t, subjectId: s.id, subjectLabel: s.short, color: s.color })));
}

export const TOTAL_EXAM_QUESTIONS = SUBJECTS.reduce((acc, s) => acc + s.examQuestions, 0);
