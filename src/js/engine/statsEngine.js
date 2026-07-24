import { SUBJECTS, getSubject, allTopicsFlat } from '../data/subjects.js';
import { toDateKey, addDays, fromDateKey, MONTHS_SHORT } from '../utils/format.js';

function pct(correct, total) {
  return total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
}

export function perSubjectStats(attempts) {
  const map = {};
  SUBJECTS.forEach((s) => { map[s.id] = { subjectId: s.id, answered: 0, correct: 0, timeTotal: 0 }; });
  attempts.forEach((a) => {
    const bucket = map[a.subject];
    if (!bucket) return;
    bucket.answered += 1;
    if (a.correct) bucket.correct += 1;
    bucket.timeTotal += a.timeSeconds || 0;
  });
  Object.values(map).forEach((b) => {
    b.pct = pct(b.correct, b.answered);
    b.avgTime = b.answered > 0 ? Math.round(b.timeTotal / b.answered) : 0;
  });
  return map;
}

export function perTopicStats(attempts) {
  const topics = allTopicsFlat();
  const map = {};
  topics.forEach((t) => { map[`${t.subjectId}:${t.id}`] = { ...t, answered: 0, correct: 0 }; });
  attempts.forEach((a) => {
    const key = `${a.subject}:${a.topic}`;
    const bucket = map[key];
    if (!bucket) return;
    bucket.answered += 1;
    if (a.correct) bucket.correct += 1;
  });
  Object.values(map).forEach((b) => { b.pct = pct(b.correct, b.answered); });
  return map;
}

export function heatmapData(attempts) {
  const bySubject = perSubjectStats(attempts);
  return SUBJECTS.map((s) => {
    const b = bySubject[s.id];
    let level = 'sem-dados';
    if (b.answered > 0) {
      if (b.pct >= 75) level = 'alta';
      else if (b.pct >= 50) level = 'media';
      else level = 'baixa';
    }
    return { id: s.id, label: s.short, color: s.color, answered: b.answered, pct: b.pct, level };
  });
}

export function weakestTopics(attempts, minAttempts = 2, limit = 5) {
  const topics = Object.values(perTopicStats(attempts)).filter((t) => t.answered >= minAttempts);
  return topics.sort((a, b) => a.pct - b.pct).slice(0, limit);
}

export function dailySeries(attempts, days = 14) {
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = toDateKey(addDays(new Date(), -i));
    buckets.push({ date, answered: 0, correct: 0 });
  }
  const byDate = Object.fromEntries(buckets.map((b) => [b.date, b]));
  attempts.forEach((a) => {
    const b = byDate[a.date];
    if (!b) return;
    b.answered += 1;
    if (a.correct) b.correct += 1;
  });
  return buckets.map((b) => ({ ...b, pct: pct(b.correct, b.answered) }));
}

export function weeklySeries(attempts, weeks = 8) {
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = addDays(new Date(), -i * 7);
    const start = addDays(end, -6);
    buckets.push({ start: toDateKey(start), end: toDateKey(end), answered: 0, correct: 0 });
  }
  attempts.forEach((a) => {
    const bucket = buckets.find((b) => a.date >= b.start && a.date <= b.end);
    if (!bucket) return;
    bucket.answered += 1;
    if (a.correct) bucket.correct += 1;
  });
  return buckets.map((b, i) => ({
    ...b,
    label: `S${i + 1}`,
    pct: pct(b.correct, b.answered),
  }));
}

export function monthlySeries(attempts, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), answered: 0, correct: 0 });
  }
  attempts.forEach((a) => {
    const d = fromDateKey(a.date);
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
    if (!bucket) return;
    bucket.answered += 1;
    if (a.correct) bucket.correct += 1;
  });
  return buckets.map((b) => ({ ...b, label: MONTHS_SHORT[b.month], pct: pct(b.correct, b.answered) }));
}

export function aggregateStats(state) {
  const attempts = state.attempts || [];
  const bySubject = perSubjectStats(attempts);
  const totalAnswered = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const subjectsTouched = Object.values(bySubject).filter((b) => b.answered > 0).length;
  const bestSubjectMasteryPct = Math.max(
    0,
    ...Object.values(bySubject).filter((b) => b.answered >= 8).map((b) => b.pct),
  );
  const simulados = state.simulados || [];
  const bestSimuladoPct = simulados.length ? Math.max(...simulados.map((s) => s.scorePct)) : 0;
  const focusSeconds = (state.focusSessions || []).reduce((acc, f) => acc + f.seconds, 0);
  const avgTimePerQuestion = totalAnswered > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.timeSeconds || 0), 0) / totalAnswered)
    : 0;

  return {
    totalAnswered,
    correctCount,
    accuracyOverall: pct(correctCount, totalAnswered),
    subjectsTouched,
    bestSubjectMasteryPct,
    simuladosCount: simulados.length,
    bestSimuladoPct,
    flashcardReviews: state.gamification.totalFlashcardReviews || 0,
    focusSeconds,
    avgTimePerQuestion,
    bestStreak: state.gamification.streakBest || 0,
    currentStreak: state.gamification.streakCurrent || 0,
    bySubject,
  };
}

export { pct };
