import { SUBJECTS } from '../data/subjects.js';
import { weakestTopics } from './statsEngine.js';
import { daysBetween, toDateKey } from '../utils/format.js';

// The plan is always computed live from the current date + current
// performance, instead of stored as a rigid calendar — so "atraso" nos
// estudos nunca deixa o cronograma desatualizado: basta reabrir a tela do
// plano para obter a distribuição recalculada automaticamente.
export function daysUntilExam(examDate) {
  if (!examDate) return null;
  return Math.max(0, daysBetween(toDateKey(new Date()), examDate));
}

// Weight = base exam weight (equal across the 4 disciplines) adjusted by an
// urgency factor: subjects with lower accuracy (or not yet practiced) get a
// higher share of study time.
export function computeSubjectWeights(bySubjectStats) {
  const weights = SUBJECTS.map((s) => {
    const stat = bySubjectStats[s.id];
    const answered = stat?.answered || 0;
    const acc = stat?.pct ?? 0;
    // Unexplored subjects (few attempts) are treated as high-priority too,
    // so the plan doesn't ignore a subject the student simply hasn't tried yet.
    const explorationBoost = answered < 8 ? (8 - answered) * 3 : 0;
    const gapFromTarget = Math.max(0, 80 - acc);
    const urgency = 20 + gapFromTarget + explorationBoost;
    return { subjectId: s.id, label: s.short, color: s.color, urgency };
  });
  const total = weights.reduce((acc, w) => acc + w.urgency, 0) || 1;
  return weights.map((w) => ({ ...w, sharePct: Math.round((w.urgency / total) * 1000) / 10 }));
}

export function generateWeeklyAllocation({ dailyHours, bySubjectStats }) {
  const weights = computeSubjectWeights(bySubjectStats);
  const weeklyMinutes = Math.round((dailyHours || 2) * 60 * 7);
  return weights.map((w) => ({
    ...w,
    minutesPerWeek: Math.round((w.sharePct / 100) * weeklyMinutes),
  }));
}

export function generateTodayPlan({ dailyHours, bySubjectStats, attempts }) {
  const weights = computeSubjectWeights(bySubjectStats).sort((a, b) => b.urgency - a.urgency);
  const todayMinutes = Math.round((dailyHours || 2) * 60);
  const dayIndex = new Date().getDay();
  // Rotate which subjects get emphasis today so the week doesn't repeat the
  // exact same order every day, while still respecting overall priority.
  const rotated = [...weights.slice(dayIndex % weights.length), ...weights.slice(0, dayIndex % weights.length)];
  const focusSubjects = rotated.slice(0, 3);
  const focusTotalWeight = focusSubjects.reduce((acc, w) => acc + w.urgency, 0) || 1;

  const weakTopics = weakestTopics(attempts, 1, 20);

  return focusSubjects.map((w) => {
    const minutes = Math.max(10, Math.round((w.urgency / focusTotalWeight) * todayMinutes));
    const weakTopic = weakTopics.find((t) => t.subjectId === w.subjectId);
    return {
      subjectId: w.subjectId,
      label: w.label,
      color: w.color,
      minutes,
      suggestedTopic: weakTopic ? weakTopic.label : null,
    };
  });
}

// Heuristic, clearly-labelled ESTIMATE (never a guarantee) of exam readiness,
// combining question-bank coverage, accuracy and mock-exam performance,
// discounted by how little time remains until the exam.
export function estimateReadiness({ examDate, accuracyOverall, totalAnswered, bestSimuladoPct, simuladosCount }) {
  const coverageScore = Math.min(100, (totalAnswered / 200) * 100);
  const accuracyScore = accuracyOverall;
  const simuladoScore = simuladosCount > 0 ? bestSimuladoPct : accuracyOverall * 0.7;
  let base = coverageScore * 0.3 + accuracyScore * 0.45 + simuladoScore * 0.25;

  const days = daysUntilExam(examDate);
  if (days !== null && days <= 14 && totalAnswered < 100) {
    base *= 0.85; // pouco tempo restante e pouca prática acumulada
  }

  return Math.max(0, Math.min(100, Math.round(base)));
}
