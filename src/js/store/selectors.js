import { toDateKey } from '../utils/format.js';
import { getSubject, getTopic } from '../data/subjects.js';
import { FLASHCARDS } from '../data/flashcards.js';
import { MISSION_TEMPLATES, missionsForDate } from '../data/missions.js';
import { isDue, reviewBucketLabel } from '../engine/srs.js';

export function dueQuestionReviews(state) {
  const today = toDateKey(new Date());
  return Object.entries(state.reviewQueue)
    .filter(([, r]) => r.dueDate && r.dueDate <= today)
    .map(([questionId, r]) => ({
      questionId,
      subject: r.subject,
      topic: r.topic,
      subjectLabel: getSubject(r.subject)?.short,
      topicLabel: getTopic(r.subject, r.topic)?.label,
      stage: r.stage,
      dueDate: r.dueDate,
      bucket: reviewBucketLabel(r.dueDate),
    }));
}

export function upcomingQuestionReviews(state) {
  const today = toDateKey(new Date());
  return Object.entries(state.reviewQueue)
    .filter(([, r]) => r.dueDate && r.dueDate > today)
    .map(([questionId, r]) => ({
      questionId,
      subject: r.subject,
      topic: r.topic,
      dueDate: r.dueDate,
      bucket: reviewBucketLabel(r.dueDate),
    }));
}

export function dueFlashcards(state) {
  return FLASHCARDS.filter((c) => {
    const s = state.flashcardState[c.id];
    if (!s) return true; // never studied = available to learn now
    return isDue(s.dueDate);
  });
}

// Only cards the student has already studied before and that came back due —
// used for "pending review" urgency indicators, so a brand-new deck full of
// never-seen cards doesn't look like a backlog of forgotten content.
export function dueFlashcardsReviewOnly(state) {
  return FLASHCARDS.filter((c) => {
    const s = state.flashcardState[c.id];
    return s && isDue(s.dueDate);
  });
}

export function flashcardDeckProgress(state) {
  const total = FLASHCARDS.length;
  const studied = FLASHCARDS.filter((c) => state.flashcardState[c.id]).length;
  const due = dueFlashcards(state).length;
  return { total, studied, due, new: total - studied };
}

function attemptsToday(state) {
  const today = toDateKey(new Date());
  return state.attempts.filter((a) => a.date === today);
}

export function missionsProgressToday(state) {
  const today = toDateKey(new Date());
  const todaysAttempts = attemptsToday(state);
  const answeredToday = todaysAttempts.length;
  const correctToday = todaysAttempts.filter((a) => a.correct).length;
  const accuracyToday = answeredToday > 0 ? Math.round((correctToday / answeredToday) * 100) : 0;
  const flashcardsToday = Object.values(state.flashcardState).filter((s) => s.lastReviewed === today).length;
  const focusMinutesToday = Math.round(
    (state.focusSessions.filter((f) => f.date === today).reduce((acc, f) => acc + f.seconds, 0)) / 60,
  );
  const studyMinutesToday = focusMinutesToday + Math.round(todaysAttempts.reduce((acc, a) => acc + (a.timeSeconds || 0), 0) / 60);
  const simuladosToday = state.simulados.filter((s) => toDateKey(new Date(s.createdAt)) === today).length;
  const subjectsToday = new Set(todaysAttempts.map((a) => a.subject)).size;

  const metrics = { answeredToday, accuracyToday, flashcardsToday, focusMinutesToday, studyMinutesToday, simuladosToday, subjectsToday };

  const missions = missionsForDate(today, 3).map((m) => {
    const value = metrics[m.metric] || 0;
    const eligible = !m.minAttempts || answeredToday >= m.minAttempts;
    const done = eligible && value >= m.target;
    return { ...m, value, done, progressPct: Math.min(100, Math.round((value / m.target) * 100)) };
  });

  return { metrics, missions };
}

export { MISSION_TEMPLATES };
