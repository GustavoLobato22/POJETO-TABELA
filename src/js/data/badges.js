// Conquistas (badges). `check(stats)` recebe o objeto agregado produzido por
// engine/statsEngine.js e retorna true quando o badge deve estar desbloqueado.
export const BADGES = [
  {
    id: 'first-question', label: 'Primeiro Passo', icon: 'target',
    description: 'Respondeu à primeira questão da plataforma.',
    check: (s) => s.totalAnswered >= 1,
  },
  {
    id: 'streak-3', label: 'Consistência', icon: 'flame',
    description: 'Estudou 3 dias seguidos.',
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: 'streak-7', label: 'Disciplina de Ferro', icon: 'flame',
    description: 'Estudou 7 dias seguidos.',
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: 'streak-30', label: 'Rotina de Sargento', icon: 'shieldStar',
    description: 'Estudou 30 dias seguidos.',
    check: (s) => s.bestStreak >= 30,
  },
  {
    id: 'fifty-questions', label: 'Ritmo de Estudo', icon: 'book',
    description: 'Respondeu 50 questões no total.',
    check: (s) => s.totalAnswered >= 50,
  },
  {
    id: 'hundred-questions', label: 'Maratonista', icon: 'graduationCap',
    description: 'Respondeu 100 questões no total.',
    check: (s) => s.totalAnswered >= 100,
  },
  {
    id: 'subject-master', label: 'Domínio de Disciplina', icon: 'medal',
    description: 'Atingiu 85% ou mais de aproveitamento em alguma disciplina (mín. 20 questões).',
    check: (s) => s.bestSubjectMasteryPct >= 85,
  },
  {
    id: 'first-simulado', label: 'Estreia no Simulado', icon: 'clipboardList',
    description: 'Concluiu o primeiro simulado cronometrado.',
    check: (s) => s.simuladosCount >= 1,
  },
  {
    id: 'simulado-80', label: 'Nota Alta', icon: 'trophy',
    description: 'Atingiu 80% ou mais de acertos em um simulado.',
    check: (s) => s.bestSimuladoPct >= 80,
  },
  {
    id: 'flashcard-100', label: 'Memória de Elite', icon: 'brain',
    description: 'Revisou 100 flashcards.',
    check: (s) => s.flashcardReviews >= 100,
  },
  {
    id: 'focus-10h', label: 'Foco Total', icon: 'timer',
    description: 'Acumulou 10 horas em sessões de foco (Pomodoro).',
    check: (s) => s.focusSeconds >= 10 * 3600,
  },
  {
    id: 'all-subjects', label: 'Visão Geral', icon: 'star',
    description: 'Praticou pelo menos uma questão de cada uma das 4 disciplinas.',
    check: (s) => s.subjectsTouched >= 4,
  },
];

export function evaluateBadges(stats) {
  return BADGES.map((b) => ({ ...b, unlocked: b.check(stats) }));
}
