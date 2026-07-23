// Modelos de missões diárias. A cada dia, engine/gamification.js seleciona um
// subconjunto determinístico (baseado na data) para compor as missões do dia.
export const MISSION_TEMPLATES = [
  { id: 'answer-10', label: 'Responda 10 questões hoje', icon: 'book', metric: 'answeredToday', target: 10, xp: 40 },
  { id: 'answer-20', label: 'Responda 20 questões hoje', icon: 'book', metric: 'answeredToday', target: 20, xp: 70 },
  { id: 'accuracy-70', label: 'Acerte 70% das questões de hoje (mín. 8)', icon: 'target', metric: 'accuracyToday', target: 70, xp: 50, minAttempts: 8 },
  { id: 'flashcards-15', label: 'Revise 15 flashcards', icon: 'brain', metric: 'flashcardsToday', target: 15, xp: 40 },
  { id: 'focus-25', label: 'Complete uma sessão de foco de 25 minutos', icon: 'timer', metric: 'focusMinutesToday', target: 25, xp: 35 },
  { id: 'study-45', label: 'Estude por 45 minutos hoje', icon: 'clock', metric: 'studyMinutesToday', target: 45, xp: 60 },
  { id: 'simulado-1', label: 'Faça pelo menos um simulado (20 questões ou mais)', icon: 'clipboardList', metric: 'simuladosToday', target: 1, xp: 80 },
  { id: 'new-subject', label: 'Pratique em pelo menos 2 disciplinas diferentes', icon: 'layers', metric: 'subjectsToday', target: 2, xp: 30 },
];

// Seleção determinística (mesmo dia = mesmas missões) usando o dateKey como seed.
export function missionsForDate(dateKey, count = 3) {
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) seed = (seed * 31 + dateKey.charCodeAt(i)) >>> 0;
  const pool = [...MISSION_TEMPLATES];
  const picked = [];
  for (let i = 0; i < count && pool.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
