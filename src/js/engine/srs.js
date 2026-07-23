// Repetição espaçada.
// 1) Flashcards usam o algoritmo SM-2 (mesmo usado pelo Anki).
// 2) Questões erradas entram numa escada de revisão fixa (24h, 7, 15, 30, 60,
//    90 dias) — a cada acerto na revisão, avança um degrau; a cada erro, volta
//    ao primeiro degrau.
import { toDateKey, addDays } from '../utils/format.js';

export const REVIEW_LADDER_DAYS = [1, 7, 15, 30, 60, 90];
export const REVIEW_LADDER_LABELS = ['24h', '7 dias', '15 dias', '30 dias', '60 dias', '90 dias'];

export function sm2Schedule(prev, quality) {
  // quality: 0 (esqueci) .. 3 (bom) .. 5 (fácil)
  const ease = prev?.ease ?? 2.5;
  const repetitions = prev?.repetitions ?? 0;
  const prevInterval = prev?.intervalDays ?? 0;

  if (quality < 3) {
    return {
      ease: Math.max(1.3, ease - 0.2),
      repetitions: 0,
      intervalDays: 1,
      dueDate: toDateKey(addDays(new Date(), 1)),
      lastReviewed: toDateKey(new Date()),
    };
  }

  const newEase = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  let intervalDays;
  if (repetitions === 0) intervalDays = 1;
  else if (repetitions === 1) intervalDays = 6;
  else intervalDays = Math.round(prevInterval * newEase);

  return {
    ease: newEase,
    repetitions: repetitions + 1,
    intervalDays,
    dueDate: toDateKey(addDays(new Date(), intervalDays)),
    lastReviewed: toDateKey(new Date()),
  };
}

export function initialQuestionReviewStage() {
  return { stage: 0, dueDate: toDateKey(addDays(new Date(), REVIEW_LADDER_DAYS[0])) };
}

export function advanceQuestionReview(prevStage, wasCorrect) {
  if (!wasCorrect) {
    return { stage: 0, dueDate: toDateKey(addDays(new Date(), REVIEW_LADDER_DAYS[0])), mastered: false };
  }
  const nextStage = prevStage + 1;
  if (nextStage >= REVIEW_LADDER_DAYS.length) {
    return { stage: nextStage, dueDate: null, mastered: true };
  }
  return { stage: nextStage, dueDate: toDateKey(addDays(new Date(), REVIEW_LADDER_DAYS[nextStage])), mastered: false };
}

export function reviewBucketLabel(dueDateKey) {
  if (!dueDateKey) return null;
  const days = Math.round((new Date(dueDateKey) - new Date(toDateKey(new Date()))) / 86400000);
  if (days <= 1) return '24h';
  if (days <= 7) return '7 dias';
  if (days <= 15) return '15 dias';
  if (days <= 30) return '30 dias';
  if (days <= 60) return '60 dias';
  return '90 dias';
}

export function isDue(dueDateKey) {
  if (!dueDateKey) return false;
  return dueDateKey <= toDateKey(new Date());
}
